const messages = require('./messages');
const notifications = require('./notifications');
const order = require('./order');
const kit = require('./kit');
const shipment = require('./shipment');
const roles = require('./roles');
const topics = require('./topics');
const folders = require('./folders');
const buttons = require('./buttons');
const commons = require('./commons');
const documentTypes = require('./documentTypes');
const search = require('./search');

module.exports = {
	...messages,
	notifications,
	order,
	kit,
	shipment,
	...roles,
	...topics,
	...folders,
	...buttons,
	...commons,
	...documentTypes,
	...search
};
