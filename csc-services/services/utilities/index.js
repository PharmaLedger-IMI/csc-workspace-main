module.exports = {
    fetch: require("./fetch"),
    getOrderViewModel: function () {
        return JSON.parse(JSON.stringify(require("./order/orderViewModel")));
    }
}