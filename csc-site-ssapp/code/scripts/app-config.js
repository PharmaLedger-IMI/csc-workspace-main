const { addControllers } = WebCardinal.preload;
const cscServices = require('csc-services');
const ACTOR = cscServices.constants.Roles.Site;
const TableTemplateController = cscServices.getController('TableTemplateController', ACTOR);
const SingleOrderController = cscServices.getController('SingleOrderController', ACTOR);
const HistoryModalController = cscServices.getController('HistoryModalController', ACTOR);
addControllers({ TableTemplateController, SingleOrderController, HistoryModalController });