const { addControllers, addHook } = WebCardinal.preload;

const cscServices = require('csc-services');
const ACTOR = cscServices.constants.Roles.Site;

const TableTemplateController = cscServices.getController('TableTemplateController', ACTOR);
const SingleOrderController = cscServices.getController('SingleOrderController', ACTOR);
const HistoryModalController = cscServices.getController('HistoryModalController', ACTOR);
const HeaderController = cscServices.getController('HeaderController', ACTOR);
const NotificationsController = cscServices.getController('NotificationsController', ACTOR);
const DashboardMenuController = cscServices.getController('DashboardMenuController', ACTOR);
const DashboardController = cscServices.getController('DashboardController', ACTOR);
const OrdersController = cscServices.getController('OrdersController', ACTOR);
const SingleShipmentController = cscServices.getController('SingleShipmentController', ACTOR);
const ShipmentsController = cscServices.getController('ShipmentsController', ACTOR);
const ScanShipmentModalController = cscServices.getController('ScanShipmentModalController', ACTOR);
const TabNavigatorController = cscServices.getController('TabNavigatorController', ACTOR);
const KitSummaryController = cscServices.getController('KitSummaryController', ACTOR);
const ViewShipmentBaseController = cscServices.getController('ViewShipmentBaseController');
const KitsController = cscServices.getController('KitsController', ACTOR);
const StudiesKitsController = cscServices.getController('StudiesKitsController', ACTOR);
const KitHistoryModalController = cscServices.getController('KitHistoryModalController', ACTOR);
const ProgressStatusController = cscServices.getController('ProgressStatusController', ACTOR);
const SingleKitController = cscServices.getController('SingleKitController', ACTOR);
const KitMountingProgressController = cscServices.getController('KitMountingProgressController', ACTOR);
const StatusFilterController = cscServices.getController('StatusFilterController', ACTOR);

addHook('beforeAppLoads', async () => {
  await import('../components/share-did/share-did.js');

  addControllers({
    TableTemplateController,
    SingleOrderController,
    HistoryModalController,
    HeaderController,
    NotificationsController,
    DashboardMenuController,
    DashboardController,
    OrdersController,
    ShipmentsController,
    SingleShipmentController,
    ScanShipmentModalController,
    TabNavigatorController,
    KitsController,
    KitSummaryController,
    ViewShipmentBaseController,
    StudiesKitsController,
    KitHistoryModalController,
    ProgressStatusController,
    SingleKitController,
    KitMountingProgressController,
    StatusFilterController
  });
});