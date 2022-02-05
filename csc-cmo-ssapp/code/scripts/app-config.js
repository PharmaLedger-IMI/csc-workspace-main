const { addControllers, addHook } = WebCardinal.preload;

const cscServices = require('csc-services');
const ACTOR = cscServices.constants.Roles.CMO;

const TableTemplateController = cscServices.getController('TableTemplateController', ACTOR);
const SingleOrderController = cscServices.getController('SingleOrderController', ACTOR);
const HistoryModalController = cscServices.getController('HistoryModalController', ACTOR);
const HeaderController = cscServices.getController('HeaderController', ACTOR);
const NotificationsController = cscServices.getController('NotificationsController', ACTOR);
const DashboardMenuController = cscServices.getController('DashboardMenuController', ACTOR);
const DashboardController = cscServices.getController('DashboardController', ACTOR);
const OrdersController = cscServices.getController('OrdersController', ACTOR);
const ReviewOrderController = cscServices.getController('ReviewOrderController', ACTOR);
const SingleShipmentController = cscServices.getController('SingleShipmentController', ACTOR);
const ShipmentsController = cscServices.getController('ShipmentsController', ACTOR);
const ScanShipmentModalController = cscServices.getController('ScanShipmentModalController', ACTOR);
const TabNavigatorController = cscServices.getController('TabNavigatorController', ACTOR);
const KitSummaryController = cscServices.getController('KitSummaryController', ACTOR);
const StatusFilterController = cscServices.getController('StatusFilterController', ACTOR);


addHook('beforeAppLoads', async () => {
  const { DidInputController } = await import('../components/did-input/DidInputController.js');
  await import('../components/did-input/did-input.js');
  addControllers({
    TableTemplateController,
    SingleOrderController,
    HistoryModalController,
    HeaderController,
    NotificationsController,
    DashboardMenuController,
    DashboardController,
    OrdersController,
    ReviewOrderController,
    SingleShipmentController,
    ShipmentsController,
    ScanShipmentModalController,
    TabNavigatorController,
    KitSummaryController,
    StatusFilterController,
    DidInputController
  });
});
