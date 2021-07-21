module.exports = {
    getOrderViewModel: function () {
        return JSON.parse(JSON.stringify(require("./order/orderViewModel")));
    }
}