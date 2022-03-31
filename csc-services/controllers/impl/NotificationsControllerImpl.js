const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const { Topics, Commons } = cscServices.constants;
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
		this.model.notificationsEmpty = (notifications.length == 0)
	}

	transformData(notifications) {
		return notifications.map(notification => {
			const details = {
				status: notification.status,
				date: momentService(notification.date).format(Commons.DateTimeFormatPattern)
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
					details.type = NotificationTypesEnum.StudyKits;
					details.id = notification.studyId;
					break;
				}
			}

			notification.details = details;
			return notification;
		});
	}

	viewNotificationHandler() {
		this.onTagClick('view-notification', (model) => {
			const { uid, operation } = model;
			if (uid && operation) {
				let pageTag;
				let state;
				switch (operation) {
					case NotificationTypes.UpdateOrderStatus: {
						pageTag = 'order';
						state = {
							uid: uid
						}
							break;
					}

					case NotificationTypes.UpdateShipmentStatus: {
						pageTag = 'shipment';
						state = {
							uid: uid
						}
						break;
					}

					case NotificationTypes.UpdateKitStatus: {
						pageTag = 'study-kits';
						state = {
							orderId: model.orderId,
							studyId: model.studyId
						};
						break;
					}
				}

				if (pageTag) {
					this.navigateToPageTag(pageTag, state);
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
