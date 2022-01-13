 const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const ProfileService = cscServices.ProfileService;
const {getCommunicationServiceInstance} = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const { order, shipment, Roles, Topics, kit } = cscServices.constants;
const { NotificationTypes } = cscServices.constants.notifications;
const { orderStatusesEnum } = order;
const { shipmentStatusesEnum , shipmentsEventsEnum} = shipment;
const { kitsMessagesEnum, kitsStatusesEnum } = kit;
const KitsService = cscServices.KitsService;

class DashboardControllerImpl extends WebcController {
	constructor(role, ...props) {
		super(...props);

		this.role = role;
		this.ordersService = new OrdersService(this.DSUStorage);
		this.shipmentService = new ShipmentsService(this.DSUStorage);
		this.notificationsService = new NotificationsService(this.DSUStorage, this.communicationService);
		this.kitsService = new KitsService(this.DSUStorage);

		let selectedTab;

		if (this.history.location.state && this.history.location.state.tab) {
			selectedTab = this.history.location.state.tab;
		} else {
			selectedTab = this.role === Roles.Site ? Topics.Shipment : Topics.Order;
		}

		this.model = {
			tabNavigator: {
				selected: selectedTab
			}
		};

		this.attachHandlers();
		this.initServices();
	}

	async initServices() {
		this.profileService = ProfileService.getProfileServiceInstance();
		this.model.did = await this.profileService.getDID();
		const didData =  ProfileService.getDidData(this.model.did);
		this.communicationService = getCommunicationServiceInstance(didData);

		this.ordersService.onReady(() => {
			this.shipmentService.onReady(() => {
				this.handleMessages();
			});
		});
	}

	attachHandlers() {
		this.modelExpressionsHandler();
		this.changeTabHandler();
	}

	modelExpressionsHandler() {
		this.model.addExpression('isOrdersSelected', () => this.model.tabNavigator.selected === Topics.Order, 'tabNavigator.selected');
		this.model.addExpression('isShipmentsSelected', () => this.model.tabNavigator.selected === Topics.Shipment, 'tabNavigator.selected');
		this.model.addExpression('isKitsSelected', () => this.model.tabNavigator.selected === Topics.Kits, 'tabNavigator.selected');
	}

	changeTabHandler() {
		this.onTagClick('change-tab', async (model, target) => {
			this.model.tabNavigator.selected = target.getAttribute('data-custom');
		});
	}

	handleMessages() {
		this.communicationService.listenForMessages(async (err, data) => {

			console.log("MESAJ PRIMIT", data);

			if (err) {
				return console.error(err);
			}

			await this.handleOrderMessages(data);
			await this.handleShipmentMessages(data);
			await this.handleKitsMessages(data);
		});
	}

	async handleOrderMessages(data) {
		data = JSON.parse(data);
		console.log('message received', data);
		const [orderData, orderStatus, notificationRole] = await this.processOrderMessage(data);
		if (!orderData || !orderStatus || !notificationRole) {
			return;
		}

		console.log('order message received', orderData, orderStatus, notificationRole);
		const notification = {
			operation: NotificationTypes.UpdateOrderStatus,
			orderId: orderData.orderId,
			read: false,
			status: orderStatus,
			keySSI: data.data.orderSSI,
			role: notificationRole,
			did: orderData.sponsorId,
			date: new Date().getTime()
		};

		const notificationResult = await this.notificationsService.insertNotification(notification);
		eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
		eventBusService.emitEventListeners(Topics.RefreshOrders, null);
		eventBusService.emitEventListeners(Topics.RefreshOrders + orderData.orderId, null);
		console.log('notification added', notification, notificationResult);
	}

	async handleShipmentMessages(data) {
		data = JSON.parse(data);
		console.log('message received', data);
		const [shipmentData, shipmentStatus, notificationRole] = await this.processShipmentMessage(data);
		if (!shipmentData || !shipmentStatus || !notificationRole) {
			return;
		}

		console.log('shipment message received', shipmentData, shipmentStatus, notificationRole);
		const notification = {
			operation: NotificationTypes.UpdateShipmentStatus,
			shipmentId: shipmentData.shipmentId,
			read: false,
			status: shipmentStatus,
			keySSI: data.data.shipmentSSI,
			role: notificationRole,
			did: shipmentData.sponsorId,
			date: new Date().getTime()
		};

		const notificationResult = await this.notificationsService.insertNotification(notification);
		eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
		eventBusService.emitEventListeners(Topics.RefreshShipments, null);
		eventBusService.emitEventListeners(Topics.RefreshShipments + shipmentData.shipmentId, null);

		//TODO: refactor this logic
		//added for the case when shipment is receiving a new shipmentId but the listeners are already using the initial shipmentId (which is orderId by convention)
		if (shipmentStatus === shipmentStatusesEnum.Dispatched || shipmentStatus === shipmentStatusesEnum.PickUpAtWarehouse && this.role === Roles.Sponsor) {
			eventBusService.emitEventListeners(Topics.RefreshShipments + shipmentData.orderId, null);
		}
		
		console.log('notification added', notification, notificationResult);
	}

	async handleKitsMessages(data) {
		data = JSON.parse(data);
		console.log('message received', data);
		const [kitsData, notificationRole] = await this.processKitsMessage(data);
		if (!kitsData || !notificationRole) {
			return;
		}

		eventBusService.emitEventListeners(Topics.RefreshKits, null);
	}

	async processOrderMessage(data) {
		let orderData;
		let orderStatus = data.operation;
		let notificationRole;

		switch (orderStatus) {
			case orderStatusesEnum.Initiated: {
				notificationRole = Roles.Sponsor;

				const {
					orderSSI,
					sponsorDocumentsKeySSI,
					cmoDocumentsKeySSI,
					kitIdsKeySSI,
					commentsKeySSI,
					statusKeySSI
				} = data.data;
				orderData = await this.ordersService.mountAndReceiveOrder(orderSSI, this.role,
					{ sponsorDocumentsKeySSI, cmoDocumentsKeySSI, kitIdsKeySSI, commentsKeySSI, statusKeySSI });

				break;
			}

			//TODO are you sure that the order was mounted previously?
			// if user is offline and an order will pass through many states: Initiated, Reviewed by CMO, Accepted,
			// the communication system will raise 3 different events and
			//   1. the order of the events may not be the same
			//   2. the communicationService is not waiting, it will provide the next message ASAP

			case orderStatusesEnum.ReviewedByCMO: {
				notificationRole = Roles.CMO;
				orderData = await this.ordersService.updateLocalOrder(data.data.orderSSI);

				break;
			}

			case orderStatusesEnum.Canceled: {
				notificationRole = Roles.Sponsor;
				orderData = await this.ordersService.updateLocalOrder(data.data.orderSSI);

				break;
			}

			case orderStatusesEnum.Approved: {
				notificationRole = Roles.Sponsor;
				orderData = await this.ordersService.updateLocalOrder(data.data.orderSSI);

				break;
			}
		}

		return [orderData, orderStatus, notificationRole];
	}

	async processShipmentMessage(data) {
		let shipmentData;
		let shipmentStatus = data.operation;
		let notificationRole;

		switch (shipmentStatus) {
			case shipmentStatusesEnum.InPreparation: {
				notificationRole = Roles.CMO;

				const { shipmentSSI, statusSSI } = data.data;

				shipmentData = await this.shipmentService.mountAndReceiveShipment(shipmentSSI, this.role, statusSSI);
				await this.ordersService.updateLocalOrder(shipmentData.orderSSI, { shipmentSSI: shipmentSSI });
				break;
			}

			case shipmentStatusesEnum.ReadyForDispatch: {
				notificationRole = Roles.CMO;

				const { shipmentSSI } = data.data;
				shipmentData = await this.shipmentService.updateLocalShipment(shipmentSSI);
				break;
			}

			case shipmentStatusesEnum.ShipmentCancelled: {
				notificationRole = Roles.Sponsor;

				const { shipmentSSI } = data.data;
				shipmentData = await this.shipmentService.updateLocalShipment(shipmentSSI);
				break;
			}

			case shipmentStatusesEnum.Dispatched:
			case shipmentStatusesEnum.PickUpAtWarehouse:
			case shipmentStatusesEnum.InTransit: {

				notificationRole = Roles.Courier;
				const messageData = data.data;
				const { shipmentSSI } = messageData;
				//SITE will receive on InTransit status all the details except shipmentBilling
				if (messageData.transitShipmentSSI) {
					shipmentData = { ...await this.shipmentService.mountAndReceiveTransitShipment(shipmentSSI, messageData.transitShipmentSSI, messageData.statusSSI, this.role) };
				}
				if (messageData.shipmentBilling) {
					shipmentData = { ...shipmentData, ...await this.shipmentService.mountShipmentBillingDSU(shipmentSSI, messageData.shipmentBilling)}
				}
				if (messageData.shipmentDocuments) {
					shipmentData = { ...shipmentData, ...await this.shipmentService.mountShipmentDocumentsDSU(shipmentSSI,messageData.shipmentDocuments) };
				}
				if (messageData.shipmentComments) {
					shipmentData = { ...shipmentData, ...await this.shipmentService.mountShipmentCommentsDSU(shipmentSSI,messageData.shipmentComments) };
				}
				break;
			}
			case shipmentStatusesEnum.Delivered: {
				notificationRole = Roles.Courier;
				const messageData = data.data;
				const { shipmentSSI } = messageData;
				shipmentData = await this.shipmentService.updateShipmentDB(shipmentSSI);
				break;
			}
			case shipmentStatusesEnum.Received: {
				notificationRole = Roles.Site;
				const messageData = data.data;
				const { receivedShipmentSSI, shipmentSSI } = messageData;
				shipmentData = await this.shipmentService.mountShipmentReceivedDSU(shipmentSSI, receivedShipmentSSI);
				break;
			}
			case shipmentsEventsEnum.InTransitNewComment: {
				notificationRole = Roles.Courier;
				const { shipmentSSI } = data.data;
				shipmentData = await this.shipmentService.getShipment(shipmentSSI);
				break;
			}
		}

		return [shipmentData, shipmentStatus, notificationRole];
	}

	async processKitsMessage(data) {
		let kitsData;
		let kitsMessage = data.operation;
		let notificationRole = Roles.Site;

		switch (kitsMessage) {
			case kitsMessagesEnum.ShipmentSigned: {
				const { studyKeySSI } = data.data;
				kitsData = await this.kitsService.getStudyKitsDSUAndUpdate(studyKeySSI);

				//all kits will have the same orderId
				const orderId = kitsData.kits[0].orderId;
				const notification = {
					operation: NotificationTypes.UpdateKitStatus,
					studyId: kitsData.studyId,
					orderId: orderId,
					read: false,
					status: "Kits were received",
					keySSI: data.data.studyKeySSI,
					role: notificationRole,
					did: "-",
					date: new Date().getTime()
				};

				await this.notificationsService.insertNotification(notification);
				break;
			}

			case kitsStatusesEnum.AvailableForAssignment:
			case kitsStatusesEnum.Assigned:
			case kitsStatusesEnum.Dispensed: {
				const { kitSSI } = data.data;
				kitsData = await this.kitsService.updateStudyKitRecordKitSSI(kitSSI, kitsMessage);
				break;
			}
		}
		return [kitsData, notificationRole];
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('DashboardController', DashboardControllerImpl);
