module.exports = {
    OrderService: require("./services/OrdersService.js"),
    EventBusService:require("./services/lib/EventBusService"),
    NotificationsService:require("./services/lib/NotificationService"),
    CommunicationService:require("./services/lib/CommunicationService"),
    constants:require("./services/constants"),
    momentService: require("./services/lib/moment.min"),

    viewModelResolver:function (viewModel){
        switch (viewModel){
            case "order":
                return require("./services/utilities").getOrderViewModel();
            default:
                throw new Error ("Requested view model not found");
        }
    }
}
