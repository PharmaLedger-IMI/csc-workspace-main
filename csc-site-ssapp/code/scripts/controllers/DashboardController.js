const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const CommunicationService = cscServices.CommunicationService;
const { messagesEnum, order, NotificationTypes, Roles, Topics } = cscServices.constants;
const { orderStatusesEnum } = order;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;

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
      // TODO: Refactor this
      userProfile: {
        logoURL: '../resources/images/pl_logo.png',
        appName: 'SITE',
        userName: 'SITEName1',
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
          if (data.message.data.orderSSI && data.message.data.kitIdsKeySSI && data.message.data.commentsKeySSI && data.message.data.statusKeySSI) {
             let orderData = await this.ordersService.mountAndReceiveOrder(
                data.message.data.orderSSI,
                Roles.Site,
                undefined,
                undefined,
                data.message.data.kitIdsKeySSI,
                data.message.data.commentsKeySSI,
                data.message.data.statusKeySSI
            );

            const notification = {
                operation: NotificationTypes.UpdateOrderStatus,
                orderId: orderData.orderId,
                read: false,
                status: orderStatusesEnum.Initiated,
                keySSI: data.message.data.orderSSI,
                role: Roles.Sponsor,
                did: orderData.sponsorId,
                date: new Date().toISOString(),
            };

            await this.notificationsService.insertNotification(notification);
            eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
            eventBusService.emitEventListeners(Topics.RefreshOrders, null);
            console.log('order added');
          }
          break;
        }
        case messagesEnum.StatusReviewedByCMO: {
          console.log('message received');
          console.log(data);

          //TODO are you sure that the order was mounted previously?
          // if user is offline and an order will pass through many states: Initated, Reviewed by CMO, Accepted,
          // the communication system will raise 3 different events and
          //   1. the order of the events may not be the same
          //   2. the communicationService is not waiting, it will provide the next message ASAP


          if (data.message.data.orderSSI) {
            const order = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

            const notification = {
              operation: NotificationTypes.UpdateOrderStatus,
              orderId: order.orderId,
              read: false,
              status: orderStatusesEnum.ReviewedByCMO,
              keySSI: data.message.data.orderSSI,
              role: Roles.CMO,
              did: order.sponsorId,
              date: new Date().toISOString()
            };

            await this.notificationsService.insertNotification(notification);
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
            const order = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

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

            await this.notificationsService.insertNotification(notification);
            eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
            eventBusService.emitEventListeners(Topics.RefreshOrders, null);
            console.log('order added');
          }
          break;
        }

        case messagesEnum.StatusCanceled: {
          if (data.message.data.orderSSI) {
            const order = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

            const notification = {
              operation: NotificationTypes.UpdateOrderStatus,
              orderId: order.orderId,
              read: false,
              status: orderStatusesEnum.Canceled,
              keySSI: data.message.data.orderSSI,
              role: Roles.Sponsor,
              did: order.sponsorId,
              date: new Date().toISOString(),
            };

            await this.notificationsService.insertNotification(notification);
            eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
            eventBusService.emitEventListeners(Topics.RefreshOrders, null);
          }
          break;
        }
        case messagesEnum.StatusApproved: {
          if (data.message.data.orderSSI) {
            const order = await this.ordersService.updateLocalOrder(data.message.data.orderSSI);

            const notification = {
              operation: NotificationTypes.UpdateOrderStatus,
              orderId: order.orderId,
              read: false,
              status: orderStatusesEnum.Approved,
              keySSI: data.message.data.orderSSI,
              role: Roles.Sponsor,
              did: order.sponsorId,
              date: new Date().toISOString(),
            };

            await this.notificationsService.insertNotification(notification);
            eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
            eventBusService.emitEventListeners(Topics.RefreshOrders, null);
          }
          break;
        }


      }
    });
  }

  attachAll() {
    this.model.addExpression('isOrdersSelected', () => this.model.tabNavigator.selected === '0', 'tabNavigator.selected');
    this.model.addExpression('isShipmentsSelected', () => this.model.tabNavigator.selected === '1', 'tabNavigator.selected');
    this.model.addExpression('isKitsSelected', () => this.model.tabNavigator.selected === '2', 'tabNavigator.selected');

    this.onTagClick('change-tab', async (model, target, event) => {
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.remove('active');
      this.model.tabNavigator.selected = target.getAttribute('data-custom');
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.add('active');
    });
  }
}
