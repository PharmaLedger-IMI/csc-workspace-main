const getSharedStorage  = require('./SharedDBStorageService.js').getSharedStorage;

module.exports = class NotificationsService {
  NOTIFICATIONS_TABLE = 'notifications';

  constructor(DSUStorage) {
    this.storageService = getSharedStorage(DSUStorage);
  }

  async getNumberOfUnreadNotifications() {
    const notifications = await this.storageService.filter(this.NOTIFICATIONS_TABLE);
    return notifications.filter((x) => !x.read).length;
  }

  async getNotifications() {
    const notifications = await this.storageService.filter(this.NOTIFICATIONS_TABLE);
    return notifications;
  }

  async insertNotification(notification) {
    const notifications = await this.storageService.filter(this.NOTIFICATIONS_TABLE);
    const id = notifications.length || 0;
    const newRecord = await this.storageService.insertRecord(this.NOTIFICATIONS_TABLE, id, notification);
    return newRecord;
  }

  async getNotification(id) {
    const notification = await this.storageService.getRecord(this.NOTIFICATIONS_TABLE, id);
    return notification;
  }

  async changeNotificationStatus(id) {
    const notification = await this.getNotification(id);
    await this.storageService.updateRecord(this.NOTIFICATIONS_TABLE, id, { ...notification, read: !notification.read });
    return;
  }
}
