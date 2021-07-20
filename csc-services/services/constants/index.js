const messages = require("./messages");
const notifications = require("./notifications");
const order = require("./order");
const roles = require("./roles") ;
const topics = require("./topics");
module.exports = {
    ...messages, ...notifications, order, ...roles, ...topics
}