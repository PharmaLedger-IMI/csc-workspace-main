const { addControllers } = WebCardinal.preload;

const cscServices = require('csc-services');
const ACTOR = cscServices.constants.Roles.Courier;

const TableTemplateController = cscServices.getController('TableTemplateController', ACTOR);
const HistoryModalController = cscServices.getController('HistoryModalController', ACTOR);
const HeaderController = cscServices.getController('HeaderController', ACTOR);
const NotificationsController = cscServices.getController('NotificationsController', ACTOR);
const DashboardMenuController = cscServices.getController('DashboardMenuController', ACTOR);
const BaseShipmentsController = cscServices.getController('ShipmentsController', ACTOR);
const ViewShipmentBaseController = cscServices.getController('ViewShipmentBaseController');
const CourierSingleShipmentController = cscServices.getController('CourierSingleShipmentController');

addControllers({
	TableTemplateController,
	HistoryModalController,
	HeaderController,
	NotificationsController,
	DashboardMenuController,
	BaseShipmentsController,
	ViewShipmentBaseController,
	CourierSingleShipmentController
});
