const { WebcController } = WebCardinal.controllers;
import OrdersService from '../services/OrdersService.js';
import CommunicationService from '../services/CommunicationService.js';
import { messagesEnum } from '../constants/messages.js';
import { orderStatusesEnum } from '../constants/order.js';
import { NotificationTypes } from '../constants/notifications.js';
import NotificationsService from '../services/NotificationService.js';
import { Roles } from '../constants/roles.js';
import eventBusService from '../services/EventBusService.js';
import { Topics } from '../constants/topics.js';

export default class DashboardController extends WebcController {
  constructor(...props) {
    super(...props);

    this.ordersService = new OrdersService(this.DSUStorage);
    this.communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.SITE_IDENTITY);
    this.notificationsService = new NotificationsService(this.DSUStorage);

    this.model = {
      tabNavigator: {
        selected: '0',
      },
    };

    this.init();
    this.attachAll();
    this.handleMessages();
  }

  init() {}

  handleMessages() {
    this.communicationService.listenForMessages(async (err, data) => {
      if (err) {
        return console.error(err);
      }
      data = JSON.parse(data);

      switch (data.message.operation) {
        case messagesEnum.StatusInitiated: {
          console.log('message received');
          console.log(data);
          if (data.message.data.orderSSI && data.message.data.documentsSSI) {
            const order = await this.ordersService.mountOrder(
              data.message.data.orderSSI,
              data.message.data.documentsSSI
            );

            const notification = {
              operation: NotificationTypes.UpdateOrderStatus,
              orderId: order.orderId,
              read: false,
              status: orderStatusesEnum.Initiated,
              keySSI: data.message.data.orderSSI,
              role: Roles.Sponsor,
              did: order.sponsorId,
              date: new Date().toISOString(),
              documentsKeySSI: order.documentsKeySSI,
            };

            const resultNotification = await this.notificationsService.insertNotification(notification);
            eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
            eventBusService.emitEventListeners(Topics.RefreshOrders, null);
            console.log('order added');
          }
          break;
        }
        case messagesEnum.StatusReviewedByCMO: {
          console.log('message received');
          console.log(data);

          if (data.message.data.orderSSI) {
            const order = await this.ordersService.mountOrderReviewed(data.message.data.orderSSI);

            const notification = {
              operation: NotificationTypes.UpdateOrderStatus,
              orderId: order.orderId,
              read: false,
              status: orderStatusesEnum.ReviewedByCMO,
              keySSI: data.message.data.orderSSI,
              role: Roles.CMO,
              did: order.sponsorId,
              date: new Date().toISOString(),
            };

            const resultNotification = await this.notificationsService.insertNotification(notification);
            eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
            eventBusService.emitEventListeners(Topics.RefreshOrders, null);
            console.log('order added');
          }
          break;
        }

        case messagesEnum.StatusReviewedBySponsor: {
          console.log('message received');
          console.log(data);

          if (data.message.data.orderSSI) {
            const order = await this.ordersService.mountOrderReviewed(data.message.data.orderSSI);

            const notification = {
              operation: NotificationTypes.UpdateOrderStatus,
              orderId: order.orderId,
              read: false,
              status: orderStatusesEnum.ReviewedBySponsor,
              keySSI: data.message.data.orderSSI,
              role: Roles.Sponsor,
              did: order.sponsorId,
              date: new Date().toISOString(),
            };

            const resultNotification = await this.notificationsService.insertNotification(notification);
            eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
            eventBusService.emitEventListeners(Topics.RefreshOrders, null);
            console.log('order added');
          }
          break;
        }
      }
    });
  }

  attachAll() {
    this.model.addExpression(
      'isOrdersSelected',
      () => this.model.tabNavigator.selected === '0',
      'tabNavigator.selected'
    );
    this.model.addExpression(
      'isShipmentsSelected',
      () => this.model.tabNavigator.selected === '1',
      'tabNavigator.selected'
    );
    this.model.addExpression('isKitsSelected', () => this.model.tabNavigator.selected === '2', 'tabNavigator.selected');

    this.onTagClick('change-tab', async (model, target, event) => {
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.remove('active');
      this.model.tabNavigator.selected = target.getAttribute('data-custom');
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.add('active');
    });
  }
}
