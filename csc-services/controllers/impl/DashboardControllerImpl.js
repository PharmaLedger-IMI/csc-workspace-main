const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const { order, shipment, Roles, Topics } = cscServices.constants;
const { NotificationTypes } = cscServices.constants.notifications;
const { orderStatusesEnum } = order;
const { shipmentStatusesEnum } = shipment;

const csIdentities = {};
csIdentities[Roles.Sponsor] = CommunicationService.identities.CSC.SPONSOR_IDENTITY;
csIdentities[Roles.CMO] = CommunicationService.identities.CSC.CMO_IDENTITY;
csIdentities[Roles.Site] = CommunicationService.identities.CSC.SITE_IDENTITY;
csIdentities[Roles.Courier] = CommunicationService.identities.CSC.COU_IDENTITY;

class DashboardControllerImpl extends WebcController {
	constructor(role, ...props) {
		super(...props);

		this.role = role;
		this.ordersService = new OrdersService(this.DSUStorage);
		this.shipmentService = new ShipmentsService(this.DSUStorage);
		this.communicationService = CommunicationService.getInstance(csIdentities[role]);
		this.notificationsService = new NotificationsService(this.DSUStorage, this.communicationService);

		let selectedTab;

		if (this.history.location.state && this.history.location.state.tab) {
			selectedTab = this.history.location.state.tab;
		} else {
			selectedTab = Topics.Order;
		}

		this.model = {
			tabNavigator: {
				selected: selectedTab
			}
		};

		this.attachHandlers();
	}

	attachHandlers() {
		this.modelExpressionsHandler();
		this.serviceReadyHandler();
		this.changeTabHandler();
	}

	modelExpressionsHandler() {
		this.model.addExpression('isOrdersSelected', () => this.model.tabNavigator.selected === Topics.Order, 'tabNavigator.selected');
		this.model.addExpression('isShipmentsSelected', () => this.model.tabNavigator.selected === Topics.Shipment, 'tabNavigator.selected');
		this.model.addExpression('isKitsSelected', () => this.model.tabNavigator.selected === Topics.Kits, 'tabNavigator.selected');
	}

	serviceReadyHandler() {
		this.ordersService.onReady(() => {
			this.shipmentService.onReady(() => {
				this.handleMessages();
			});
		});
	}

	changeTabHandler() {
		this.onTagClick('change-tab', async (model, target) => {
			this.model.tabNavigator.selected = target.getAttribute('data-custom');
		});
	}

	handleMessages() {
		this.communicationService.listenForMessages(async (err, data) => {
			if (err) {
				return console.error(err);
			}

			await this.handleOrderMessages(data);
			await this.handleShipmentMessages(data);
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
			keySSI: data.message.data.orderSSI,
			role: notificationRole,
			did: orderData.sponsorId,
			date: new Date().getTime()
		};

		const notificationResult = await this.notificationsService.insertNotification(notification);
		eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
		eventBusService.emitEventListeners(Topics.RefreshOrders, null);
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
			keySSI: data.message.data.shipmentSSI,
			role: notificationRole,
			did: shipmentData.sponsorId,
			date: new Date().getTime()
		};

		const notificationResult = await this.notificationsService.insertNotification(notification);
		eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
		eventBusService.emitEventListeners(Topics.RefreshShipments, null);
		console.log('notification added', notification, notificationResult);
	}

	async processOrderMessage(data) {
		let orderData;
		let orderStatus = data.message.operation;
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
				} = data.message.data;
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
				orderData = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

				break;
			}

			case orderStatusesEnum.ReviewedBySponsor: {
				notificationRole = Roles.Sponsor;
				orderData = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

				break;
			}

			case orderStatusesEnum.Canceled: {
				notificationRole = Roles.Sponsor;
				orderData = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

				break;
			}

			case orderStatusesEnum.Approved: {
				notificationRole = Roles.Sponsor;
				orderData = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

				break;
			}
		}

		return [orderData, orderStatus, notificationRole];
	}

	async processShipmentMessage(data) {
		let shipmentData;
		let shipmentStatus = data.message.operation;
		let notificationRole;

		switch (shipmentStatus) {
			case shipmentStatusesEnum.InPreparation: {
				notificationRole = Roles.CMO;

				const { shipmentSSI, statusSSI } = data.message.data;

				shipmentData = await this.shipmentService.mountAndReceiveShipment(shipmentSSI, this.role, statusSSI);
				await this.ordersService.updateLocalOrder(shipmentData.orderSSI, { shipmentSSI: shipmentSSI });
				break;
			}

			case shipmentStatusesEnum.ReadyForDispatch: {
				notificationRole = Roles.CMO;

				const { shipmentSSI } = data.message.data;
				shipmentData = await this.shipmentService.updateLocalShipment(shipmentSSI);
				break;
			}

			case shipmentStatusesEnum.ShipmentCancelled: {
				notificationRole = Roles.Sponsor;

				const { shipmentSSI } = data.message.data;
				shipmentData = await this.shipmentService.updateLocalShipment(shipmentSSI);
				break;
			}

			case shipmentStatusesEnum.InTransit: {
				notificationRole = Roles.Courier;
				const { transitShipmentSSI, shipmentSSI } = data.message.data;
				shipmentData = await this.shipmentService.mountAndReceiveTransitShipment(shipmentSSI, transitShipmentSSI, this.role);
				break;
			}
		}

		return [shipmentData, shipmentStatus, notificationRole];
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('DashboardController', DashboardControllerImpl);