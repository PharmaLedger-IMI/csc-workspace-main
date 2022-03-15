module.exports = {
    fetch: require("./fetch"),
    getOrderViewModel: function () {
        return JSON.parse(JSON.stringify(require("./order/orderViewModel")));
    },
    getShipmentViewModel: function () {
        const shipmentViewModel = JSON.parse(JSON.stringify(require("./shipment/shipmentViewModel")));
        const orderViewModel = JSON.parse(JSON.stringify(require("./order/orderViewModel")));
        const form = {...orderViewModel.form, ...shipmentViewModel.form}
        return {...shipmentViewModel, form};
    },
    getKitViewModel: function () {
        return JSON.parse(JSON.stringify(require("./kit/kitViewModel")));
    }
}
