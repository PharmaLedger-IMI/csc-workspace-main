console.log(require("./services/constants"));
module.exports = {
    OrderService: require("./services/OrdersService.js"),
    EventBusService:require("./services/lib/EventBusService"),
    NotificationsService:require("./services/lib/NotificationService"),
    CommunicationService:require("./services/lib/CommunicationService"),
    constants:require("./services/constants")
}