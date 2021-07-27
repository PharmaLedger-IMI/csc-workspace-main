const { WebcController } = WebCardinal.controllers;
//Services
const cscServices = require('csc-services');

//Import
const OrdersService = cscServices.OrderService;
const NotificationsService = cscServices.NotificationsService;
const CommunicationService = cscServices.CommunicationService;
const {Topics, messagesEnum , NotificationTypes , Roles } = cscServices.constants;
const { orderStatusesEnum } = cscServices.constants.order;
const eventBusService = cscServices.EventBusService;

export default class DashboardController extends WebcController {
    constructor(...props) {
        super(...props);

        this.communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.SPONSOR_IDENTITY);
        this.ordersService = new OrdersService(this.DSUStorage, this.communicationService);
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
                case messagesEnum.StatusReviewedByCMO: {
                    console.log('message received');
                    console.log(data);
                    if (data.message.data.orderSSI) {
                        const { orderSSI} = data.message.data;
                        const order = await this.ordersService.updateLocalOrder(orderSSI);

                        const notification = {
                            operation: NotificationTypes.UpdateOrderStatus,
                            orderId: order.orderId,
                            read: false,
                            status: orderStatusesEnum.ReviewedByCMO,
                            keySSI: data.message.data.orderSSI,
                            role: Roles.CMO,
                            did: order.sponsorId,
                            date: new Date().toISOString(),
                            documentsKeySSI: order.documentsKeySSI,
                        };

                        const resultNotification = await this.notificationsService.insertNotification(notification);
                        eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
                        eventBusService.emitEventListeners(Topics.RefreshOrders, null);
                        console.log('order updated');
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
