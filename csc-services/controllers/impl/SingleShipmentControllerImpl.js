const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const { Roles, Commons, Topics } = cscServices.constants;
const { orderStatusesEnum } = cscServices.constants.order;
const { shipmentStatusesEnum } = cscServices.constants.shipment;
const ViewShipmentBaseController  = require("./helpers/ViewShipmentBaseController");
const csIdentities = {};
csIdentities [Roles.Sponsor] = CommunicationService.identities.CSC.SPONSOR_IDENTITY;
csIdentities [Roles.CMO] = CommunicationService.identities.CSC.CMO_IDENTITY;
csIdentities [Roles.Site] = CommunicationService.identities.CSC.SITE_IDENTITY;
csIdentities [Roles.Courier] = CommunicationService.identities.CSC.COU_IDENTITY;

class SingleShipmentControllerImpl extends ViewShipmentBaseController{
  constructor(role, ...props) {
    super(role,...props);
    this.role = role;

    let communicationService = CommunicationService.getInstance(csIdentities[role]);
    this.notificationsService = new NotificationsService(this.DSUStorage);
    this.ordersService = new OrdersService(this.DSUStorage, communicationService);
    this.shipmentsService = new ShipmentsService(this.DSUStorage, communicationService);

    this.initViewModel();
    this.attachEventListeners();
    this.openFirstAccordion();
  }

  attachEventListeners() {
    this.showHistoryHandler();
    this.downloadKitListHandler();
    this.downloadAttachmentHandler();
    this.toggleAccordionItemHandler();

    this.editShipmentHandler();
    this.cancelOrderHandler();
    this.navigationHandlers();
  }


  editShipmentHandler() {
    this.onTagClick('edit-shipment', () => {
      this.navigateToPageTag('edit-shipment', {
        keySSI: this.model.keySSI
      });
    });
  }

  transformOrderData(data) {
    if (data) {
      data.delivery_date = this.getDateTime(data.deliveryDate);

      data.documents = [];
      if (data.sponsorDocuments) {
        data.sponsorDocuments.forEach((doc) => {
          doc.date = momentService(doc.date).format(Commons.DateTimeFormatPattern);
          data.documents.push(doc);
        });
      }

      if (data.cmoDocuments) {
        data.cmoDocuments.forEach((doc) => {
          doc.date = momentService(doc.date).format(Commons.DateTimeFormatPattern);
          data.documents.push(doc);
        });
      }

      return data;
    }

    return {};
  }

  setShipmentActions(shipment) {
    const actions = {};
    switch(this.role) {
      case Roles.Sponsor: {
        actions.canCancelOrderAndShipment = shipment.status_value === shipmentStatusesEnum.InPreparation;
        this.attachSponsorEventHandlers();

        break;
      }

      case Roles.CMO: {
        actions.canScanShipment = shipment.status_value === shipmentStatusesEnum.InPreparation && !shipment.isShipmentScanSuccessful;
        actions.canEditShipment = shipment.status_value === shipmentStatusesEnum.InPreparation && shipment.isShipmentScanSuccessful === true;

        this.attachCmoEventHandlers();
        break;
      }

      case Roles.Site: {
        actions.canReceiveShipment = shipment.status_value === shipmentStatusesEnum.Delivered
        this.attachSiteEventHandlers();
        break;
      }
    }

    return actions;
  }

  attachSponsorEventHandlers() {
    this.cancelOrderHandler();
  }

  cancelOrderHandler() {
    this.onTagEvent('cancel-order-shipment', 'click', () => {
      this.model.cancelOrderModal = viewModelResolver('order').cancelOrderModal;
      this.showModalFromTemplate('cancelOrderModal', this.cancelOrder.bind(this), () => {
      }, {
        controller: 'CancelOrderController',
        disableExpanding: true,
        disableBackdropClosing: true,
        model: this.model
      });
    });
  }

  async cancelOrder() {
    const keySSI = this.model.shipmentModel.shipment.orderSSI;
    let comment = this.model.cancelOrderModal.comment.value ? {
          entity: this.role,
          comment: this.model.cancelOrderModal.comment.value,
          date: new Date().getTime()
        }
        : null;
    await this.ordersService.updateOrderNew(keySSI, null, comment, this.role, orderStatusesEnum.Canceled);
    await this.shipmentsService.updateShipment(this.model.keySSI, shipmentStatusesEnum.ShipmentCancelled);

    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    this.showErrorModalAndRedirect('Order and Shipment were canceled, redirecting to dashboard...', 'Order and Shipment Cancelled', '/', 2000);
  }

  attachCmoEventHandlers(){
    this.scanShipmentHandler();
  }

  attachSiteEventHandlers(){
    this.onTagClick('scan-shipment-received', () => {
      this.navigateToPageTag('scan-shipment-received', {
        shipment: {
          shipmentId: this.model.shipmentModel.shipment.shipmentId,
          ...this.model.toObject('shipmentModel.shipment')
        }
      });
    });
  }

  scanShipmentHandler() {
    this.onTagClick('scan-shipment', () => {
      this.navigateToPageTag('scan-shipment', {
        shipment: {
          shipmentId: this.model.orderModel.order.orderId,
          ...this.model.toObject('orderModel.order')
        }
      });
    });
  }


  async initViewModel() {
    const model = {
      orderModel: viewModelResolver('order'),
      shipmentModel: viewModelResolver('shipment')
    };
    model.shipmentModel.isShipmentReceived = false;
    let { keySSI } = this.history.location.state;
    model.keySSI = keySSI;

    model.shipmentModel.shipment = await this.shipmentsService.getShipment(model.keySSI);
    model.shipmentModel.shipment = { ...this.transformShipmentData(model.shipmentModel.shipment) };
    if (model.shipmentModel.shipment.shipmentComments) {
      model.shipmentModel.shipment.comments = await this.getShipmentComments(model.shipmentModel.shipment);
    }

    model.actions = this.setShipmentActions(model.shipmentModel.shipment);

    model.orderModel.order = await this.ordersService.getOrder(model.shipmentModel.shipment.orderSSI);
    model.orderModel.order = { ...this.transformOrderData(model.orderModel.order) };

    model.documents = [];
    if (model.orderModel.order.documents) {
      model.documents = model.documents.concat(model.orderModel.order.documents);
    }
    if (model.shipmentModel.shipment.documents) {
      model.documents = model.documents.concat(model.shipmentModel.shipment.documents);
    }

    if (model.shipmentModel.shipment.receivedDSUKeySSI) {
        const receivedDSU  = await this.shipmentService.getShipmentReceivedDSU(model.shipmentModel.shipment.receivedDSUKeySSI);
        model.shipmentModel = {...model.shipmentModel, ...JSON.parse(JSON.stringify(receivedDSU))};
        model.shipmentModel.kits = await this.ordersService.getKitIds(model.shipmentModel.shipment.kitIdSSI);
        model.shipmentModel.isShipmentReceived = true;
        }

    if(model.shipmentModel.shipment.shipmentDocuments){
      let shipmentDocuments  = await this.getShipmentDocuments(model.shipmentModel.shipment);
      model.documents = model.documents.concat(shipmentDocuments);
    }

    this.model = model;
    this.attachRefreshListeners();
  }

}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('SingleShipmentController', SingleShipmentControllerImpl);