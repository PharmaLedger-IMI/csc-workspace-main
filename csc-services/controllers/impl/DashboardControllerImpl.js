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

		this.model = {
			tabNavigator: {
				selected: '0'
			}
		};

		this.attachHandlers();
	}

	attachHandlers() {
		this.ordersService.onReady(() => {
			this.handleMessages();
		});

		this.shipmentService.onReady(() => {
			this.handleMessages();
		});

		this.model.addExpression('isOrdersSelected', () => this.model.tabNavigator.selected === '0', 'tabNavigator.selected');
		this.model.addExpression('isShipmentsSelected', () => this.model.tabNavigator.selected === '1', 'tabNavigator.selected');
		this.model.addExpression('isKitsSelected', () => this.model.tabNavigator.selected === '2', 'tabNavigator.selected');

		this.onTagClick('change-tab', async (model, target) => {
			document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.remove('active');
			this.model.tabNavigator.selected = target.getAttribute('data-custom');
			document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.add('active');
		});
	}

	handleMessages() {
		this.communicationService.listenForMessages(async (err, data) => {
			if (err) {
				return console.error(err);
			}

			this.handleOrderMessages(data);
			this.handleShipmentMessages(data);
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

				const {
					shipmentSSI,
					statusSSI
				} = data.message.data;

				// TODO: Update local order using shipment details
				shipmentData = await this.shipmentService.mountAndReceiveShipment(shipmentSSI, this.role, statusSSI);
				const orderData = await this.ordersService.updateLocalOrder(shipmentData.orderSSI, { shipmentSSI: shipmentSSI });

				console.log('[UPDATE LOCAL ORDER]', JSON.stringify(orderData, null, 2));
				break;
			}
		}

		return [shipmentData, shipmentStatus, notificationRole];
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('DashboardController', DashboardControllerImpl);