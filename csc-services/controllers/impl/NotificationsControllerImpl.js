const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const { Topics } = cscServices.constants;
const { NotificationTypesEnum, NotificationTypes } = cscServices.constants.notifications;

class NotificationsControllerImpl extends WebcController {
	constructor(role, ...props) {
		super(...props);

		this.role = role;
		this.model = { notifications: [] };
		this.notificationsService = new NotificationsService(this.DSUStorage);

		this.getNotifications();
		this.attachAll();
	}

	attachAll() {
		this.viewNotificationHandler();
		this.markNotificationHandler();
	}

	async getNotifications() {
		let notifications = await this.notificationsService.getNotifications();
		notifications = this.transformData(notifications);
		this.model.setChainValue('notifications', notifications);
	}

	transformData(notifications) {
		return notifications.map(notification => {
			const details = {
				status: notification.status,
				date: notification.date
			};

			switch (notification.operation) {
				case NotificationTypes.UpdateOrderStatus: {
					details.type = NotificationTypesEnum.Order;
					details.id = notification.orderId;
					break;
				}
				case NotificationTypes.UpdateShipmentStatus: {
					details.type = NotificationTypesEnum.Shipment;
					details.id = notification.shipmentId;
					break;
				}
				case NotificationTypes.UpdateKitStatus: {
					details.type = NotificationTypesEnum.Kit;
					details.id = notification.kitId;
					break;
				}
			}

			notification.details = details;
			return notification;
		});
	}

	viewNotificationHandler() {
		this.onTagClick('view-notification', (model) => {
			const { keySSI, operation } = model;
			if (keySSI && operation) {
				let pageTag;
				switch (operation) {
					case NotificationTypes.UpdateOrderStatus: {
						pageTag = 'order';
						break;
					}

					case NotificationTypes.UpdateShipmentStatus: {
						pageTag = 'shipment';
						break;
					}

					case NotificationTypes.UpdateKitStatus: {
						pageTag = 'kit';
						break;
					}
				}

				if (pageTag) {
					this.navigateToPageTag(pageTag, {
						keySSI: keySSI
					});
				}
			}
		});
	}

	markNotificationHandler() {
		this.onTagClick('mark-notification', async (model) => {
			await this.notificationsService.changeNotificationStatus(model.pk);
			await this.getNotifications();
			eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
		});
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('NotificationsController', NotificationsControllerImpl);