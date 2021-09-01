const messages = require('./messages');
const notifications = require('./notifications');
const order = require('./order');
const shipment = require('./shipment');
const roles = require('./roles');
const topics = require('./topics');
const folders = require('./folders');
const buttons = require('./buttons');
const commons = require('./commons');

module.exports = {
	...messages,
	notifications,
	order,
    shipment,
	...roles,
	...topics,
	...folders,
	...buttons,
	...commons
};
