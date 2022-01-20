const controllerRegistry = require('./controllers/ControllersRegistry').getControllersRegistry();
module.exports = {
    OrderService: require('./services/OrdersService'),
    KitsService: require('./services/KitsService'),
    ShipmentService: require('./services/ShipmentsService'),
    EventBusService: require('./services/lib/EventBusService'),
    NotificationsService: require('./services/lib/NotificationService'),
    StatusesService: require('./services/lib/StatusesService'),
    CommunicationService: require('./services/lib/CommunicationService'),
    ProfileService: require('./services/lib/ProfileService'),
    constants: require('./services/constants'),
    momentService: require('./services/lib/moment.min'),
    FileDownloaderService: require('./services/lib/FileDownloaderService'),
    utils: require('./services/lib/utils'),
    SearchService: require('./services/lib/SearchService'),
    MessageHandlerService:require("./services/MessageHandlerService"),

    viewModelResolver: function (viewModel) {
        switch (viewModel) {
            case 'order':
                return require('./services/utilities').getOrderViewModel();
            case 'shipment':
                return require('./services/utilities').getShipmentViewModel();
            case 'kit':
                return require('./services/utilities').getKitViewModel();
            default:
                throw new Error('Requested view model not found');
        }
    },
    getController: function (controllerName, actor) {
        return controllerRegistry.getControllerClass(controllerName, actor);
    },
};
