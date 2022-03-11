module.exports = {
    fetch: require("./fetch"),
    getOrderViewModel: function () {
        return require("./order/orderViewModel");
    },
    getShipmentViewModel: function () {
        const shipmentViewModel = require("./shipment/shipmentViewModel")
        const orderViewModel = require("./order/orderViewModel");
        const form = {...orderViewModel.form, ...shipmentViewModel.form}
        return {...shipmentViewModel, form};
    },
    getKitViewModel: function () {
        return require("./kit/kitViewModel");
    }
}
