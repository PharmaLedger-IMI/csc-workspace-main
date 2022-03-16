const { addControllers, addHook } = WebCardinal.preload;

const cscServices = require('csc-services');
const ACTOR = cscServices.constants.Roles.Courier;

const TableTemplateController = cscServices.getController('TableTemplateController', ACTOR);
const HistoryModalController = cscServices.getController('HistoryModalController', ACTOR);
const HeaderController = cscServices.getController('HeaderController', ACTOR);
const NotificationsController = cscServices.getController('NotificationsController', ACTOR);
const DashboardMenuController = cscServices.getController('DashboardMenuController', ACTOR);
const ShipmentsController = cscServices.getController('ShipmentsController', ACTOR);
const ViewShipmentBaseController = cscServices.getController('ViewShipmentBaseController');
const DashboardController = cscServices.getController('DashboardController', ACTOR);
const StatusFilterController = cscServices.getController('StatusFilterController', ACTOR);

addHook('beforeAppLoads', async () => {
  await import('../components/share-did/share-did.js');

  addControllers({
    TableTemplateController,
    HistoryModalController,
    HeaderController,
    NotificationsController,
    DashboardMenuController,
    ShipmentsController,
    ViewShipmentBaseController,
    DashboardController,
    StatusFilterController
  });
});
