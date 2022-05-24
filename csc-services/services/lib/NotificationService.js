const getSharedStorage = require('./SharedDBStorageService.js').getSharedStorage;
const { uuidv4 } = require("../lib/utils");
const DSUService = require('./DSUService');

module.exports = class NotificationsService  extends DSUService {
	NOTIFICATIONS_TABLE = 'notifications';

	constructor() {
		super();
		this.storageService = getSharedStorage(this.DSUStorage);
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
		const newRecord = await this.storageService.insertRecord(this.NOTIFICATIONS_TABLE, id, notification);
		return newRecord;
	}

	async getNotification(id) {
		const notification = await this.storageService.getRecord(this.NOTIFICATIONS_TABLE, id);
		return notification;
	}

	async changeNotificationStatus(id) {
		const notification = await this.getNotification(id);
		await this.storageService.updateRecord(this.NOTIFICATIONS_TABLE, id, {
			...notification,
			read: !notification.read
		});
	}
};