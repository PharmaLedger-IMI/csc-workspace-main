const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const { messagesEnum, order, shipment, NotificationTypes, Roles, Topics } = cscServices.constants;
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

			handleOrderMessages(data);
			handleShipmentMessages(data);

		});
	}

	handleOrderMessages(data) {
		data = JSON.parse(data);
		console.log('message received', data);
		const [orderData, orderStatus, notificationRole] = await this.getNotificationDataForOrderStatus(data);
		console.log('getNotificationDataForOrderStatus received', orderData, orderStatus, notificationRole);
		const notification = {
			operation: NotificationTypes.UpdateOrderStatus,
			orderId: orderData.orderId,
			read: false,
			status: orderStatus,
			keySSI: data.message.data.orderSSI,
			role: notificationRole,
			did: orderData.sponsorId,
			date: new Date().toISOString()
		};

		const notificationResult = await this.notificationsService.insertNotification(notification);
		eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
		eventBusService.emitEventListeners(Topics.RefreshOrders, null);
		console.log('notification added', notification, notificationResult);
	}


	handleShipmentMessages(data) {
		data = JSON.parse(data);
		console.log('message received', data);
		const [shipmentData, shipmentStatus, notificationRole] = await this.getNotificationDataForShipmentStatus(data);
		console.log('getNotificationDataForShipmentStatus received', shipmentData, shipmentStatus, notificationRole);
		const notification = {
			operation: NotificationTypes.UpdateShipmentStatus,
			shipmentId: shipmentData.shipmentId,
			read: false,
			status: shipmentStatus,
			keySSI: data.message.data.shipmentSSI,
			role: notificationRole,
			did: shipmentData.sponsorId,
			date: new Date().toISOString()
		};

		const notificationResult = await this.notificationsService.insertNotification(notification);
		eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
		eventBusService.emitEventListeners(Topics.RefreshShipments, null);
		console.log('notification added', notification, notificationResult);
	}

	async getNotificationDataForOrderStatus(data) {
		let orderData;
		let orderStatus;
		let notificationRole;

		switch (data.message.operation) {
			case messagesEnum.StatusInitiated: {
				notificationRole = Roles.Sponsor;
				orderStatus = orderStatusesEnum.Initiated;

				const {
					orderSSI,
					sponsorDocumentsKeySSI,
					cmoDocumentsKeySSI,
					kitIdsKeySSI,
					commentsKeySSI,
					statusKeySSI
				} = data.message.data;
				// TODO: Issue #21 - Refactor
				orderData = await this.ordersService.mountAndReceiveOrder(orderSSI, this.role,
					sponsorDocumentsKeySSI, cmoDocumentsKeySSI, kitIdsKeySSI, commentsKeySSI, statusKeySSI);

				break;
			}

			//TODO are you sure that the order was mounted previously?
			// if user is offline and an order will pass through many states: Initated, Reviewed by CMO, Accepted,
			// the communication system will raise 3 different events and
			//   1. the order of the events may not be the same
			//   2. the communicationService is not waiting, it will provide the next message ASAP

			case messagesEnum.StatusReviewedByCMO: {
				notificationRole = Roles.CMO;
				orderStatus = orderStatusesEnum.ReviewedByCMO;
				orderData = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

				break;
			}

			case messagesEnum.StatusReviewedBySponsor: {
				notificationRole = Roles.Sponsor;
				orderStatus = orderStatusesEnum.ReviewedBySponsor;
				orderData = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

				break;
			}

			case messagesEnum.StatusCanceled: {
				notificationRole = Roles.Sponsor;
				orderStatus = orderStatusesEnum.Canceled;
				orderData = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

				break;
			}

			case messagesEnum.StatusApproved: {
				notificationRole = Roles.Sponsor;
				orderStatus = orderStatusesEnum.Approved;
				orderData = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

				break;
			}
		}

		return [orderData, orderStatus, notificationRole];
	}

	async getNotificationDataForShipmentStatus(data) {
		let shipmentData;
		let shipmentStatus;
		let notificationRole;

		switch (data.message.operation) {

			case messagesEnum.ShipmentInPreparation: {
				notificationRole = Roles.CMO;
				shipmentStatus = shipmentStatusesEnum.InPreparation;

				const {
					shipmentSSI,
					statusKeySSI
				} = data.message.data;

				shipmentData = await this.shipmentService.mountAndReceiveShipment(shipmentSSI, this.role, statusKeySSI);

				break;
			}

		}
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('DashboardController', DashboardControllerImpl);