module.exports = {
    fetch: require("./fetch"),
    getOrderViewModel: function () {
        return JSON.parse(JSON.stringify(require("./order/orderViewModel")));
    },
    getShipmentViewModel: function () {
        return JSON.parse(JSON.stringify(require("./shipment/shipmentViewModel")));
    },
    getKitViewModel: function () {
        return JSON.parse(JSON.stringify(require("./kit/kitViewModel")));
    }
}
