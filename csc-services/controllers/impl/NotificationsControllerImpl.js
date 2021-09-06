const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const { Topics, Commons, NotificationTypes } = cscServices.constants;

class NotificationsControllerImpl extends WebcController {
	constructor(role, ...props) {
		super(...props);

		this.role = role;
		this.model = { notifications: [] };
		this.notificationsService = new NotificationsService(this.DSUStorage);

		this.getNotifications();
		this.attachAll();
	}

	async getNotifications() {
		let notifications = await this.notificationsService.getNotifications();
		notifications = this.transformData(notifications);
		this.model.setChainValue('notifications', notifications);
		console.log("notifications " + JSON.stringify(notifications));
	}

	transformData(data) {
		if (data) {
			data.forEach((item) => {
				item.date = item.date ? momentService(item.date).format(Commons.DateTimeFormatPattern) : '-';
			});
		}
		return data;
	}

	attachAll() {
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
				}

				if (pageTag) {
					this.navigateToPageTag(pageTag, {
						keySSI: keySSI
					});
				}
			}
		});

		this.onTagClick('mark-notification', async (model) => {
			await this.notificationsService.changeNotificationStatus(model.pk);
			await this.getNotifications();
			eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
		});
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('NotificationsController', NotificationsControllerImpl);