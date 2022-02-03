const { addControllers } = WebCardinal.preload;

const cscServices = require('csc-services');
const ACTOR = cscServices.constants.Roles.Sponsor;

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
const TabNavigatorController = cscServices.getController('TabNavigatorController', ACTOR);
const KitsController = cscServices.getController('KitsController', ACTOR);
const KitSummaryController = cscServices.getController('KitSummaryController', ACTOR);
const StudiesKitsController = cscServices.getController('StudiesKitsController', ACTOR);
const SingleKitController = cscServices.getController('SingleKitController', ACTOR);
const KitHistoryModalController = cscServices.getController('KitHistoryModalController', ACTOR);
const KitMountingProgressController = cscServices.getController('KitMountingProgressController', ACTOR);
const ProgressStatusController = cscServices.getController('ProgressStatusController', ACTOR);
const StatusFilterController = cscServices.getController('StatusFilterController', ACTOR);

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
  TabNavigatorController,
  KitsController,
  KitSummaryController,
  StudiesKitsController,
  SingleKitController,
  KitHistoryModalController,
  KitMountingProgressController,
  ProgressStatusController,
  StatusFilterController
});
