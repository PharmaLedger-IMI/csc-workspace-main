const { uuidv4 } = require("../lib/utils");
const DSUService = require('./DSUService');

module.exports = class NotificationsService  extends DSUService {
	NOTIFICATIONS_TABLE = 'notifications';

	constructor() {
		super();
	}

	async getNumberOfUnreadNotifications() {
		const notifications = await this.storageService.filter(this.NOTIFICATIONS_TABLE);
		return notifications.filter((x) => !x.read).length;
	}

	async getNotifications() {
		let notifications = await this.storageService.filter(this.NOTIFICATIONS_TABLE);
		notifications = notifications.sort((a, b) => b.date - a.date);
		return notifications;
	}

	async insertNotification(notification) {
		const id = uuidv4();
		return await this.storageService.insertRecord(this.NOTIFICATIONS_TABLE, id, notification);
	}

	async getNotification(id) {
		return await this.storageService.getRecord(this.NOTIFICATIONS_TABLE, id);
	}

	async changeNotificationStatus(id, wasRead) {
		const notification = await this.getNotification(id);
		if(!wasRead){
			wasRead = !notification.read;
		}
		await this.storageService.updateRecord(this.NOTIFICATIONS_TABLE, id, {
			...notification,
			read: wasRead
		});
	}
};