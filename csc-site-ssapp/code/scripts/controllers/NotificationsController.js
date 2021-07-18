const { WebcController } = WebCardinal.controllers;
import NotificationsService from '../services/NotificationService.js';
import eventBusService from '../services/EventBusService.js';
import { Topics } from '../constants/topics.js';

export default class NotificationsController extends WebcController {
  constructor(...props) {
    super(...props);
    this.model = { notifications: [], test: true };
    this.notificationsService = new NotificationsService(this.DSUStorage);
    this.getNotifications();
    this.attachAll();
  }

  async getNotifications() {
    let notifications = await this.notificationsService.getNotifications();
    console.log('NOTIFICATIONS:', notifications);
    this.model.setChainValue('notifications', notifications);
  }

  attachAll() {
    this.model.addExpression(
      'notificationsArrayNotEmpty',
      () => {
        return (
          this.model.notifications && Array.isArray(this.model.notifications) && this.model.notifications.length > 0
        );
      },
      'notifications'
    );

    this.onTagClick('view-order', async (model, target, event) => {
      const orderId = target.getAttribute('data-custom') || null;
      if (orderId) {
        console.log(JSON.stringify(this.model, null, 2));
        const selectedNotification = this.model.notifications.find((x) => x.orderId === orderId);
        this.navigateToPageTag('order', {
          id: orderId,
          keySSI: selectedNotification.keySSI,
          documentsKeySSI: selectedNotification.documentsKeySSI,
        });
      }
    });

    this.onTagClick('mark-order', async (model, target, event) => {
      const orderId = target.getAttribute('data-custom') || null;
      if (orderId) {
        const pk = this.model.notifications.find((x) => x.orderId === orderId).pk;
        await this.notificationsService.changeNotificationStatus(pk);
        this.getNotifications();
        eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
      }
    });
  }
}
