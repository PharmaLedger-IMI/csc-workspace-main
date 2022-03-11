const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const KitsService = cscServices.KitsService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const { Roles, Commons, Topics } = cscServices.constants;
const { orderStatusesEnum } = cscServices.constants.order;
const { shipmentStatusesEnum } = cscServices.constants.shipment;
const ViewShipmentBaseController  = require("./helpers/ViewShipmentBaseController");


class SingleShipmentControllerImpl extends ViewShipmentBaseController{
  constructor(role, ...props) {
    super(role,...props);
    this.role = role;
    this.initServices();
  }

  async initServices(){
    this.notificationsService = new NotificationsService(this.DSUStorage);
    this.ordersService = new OrdersService(this.DSUStorage);
    this.shipmentsService = new ShipmentsService(this.DSUStorage);
    this.kitsService = new KitsService(this.DSUStorage);

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
    this.navigationHandlers();
  }


  editShipmentHandler() {
    this.onTagClick('edit-shipment', () => {
      this.navigateToPageTag('edit-shipment', {
        uid: this.model.uid
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

      return data;
    }

    return {};
  }

  setShipmentActions(shipment) {
    const actions = {};
    switch(this.role) {
      case Roles.Sponsor: {
        actions.canCancelOrderAndShipment = shipment.status_value === shipmentStatusesEnum.InPreparation;
        actions.canCheckKits = !actions.canCancelOrderAndShipment;
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
        actions.canReceiveShipment = shipment.status_value === shipmentStatusesEnum.Delivered;
        actions.canManageKits = shipment.status_value === shipmentStatusesEnum.Received;
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
    await this.ordersService.updateOrder(keySSI, comment, this.role, orderStatusesEnum.Canceled);
    await this.shipmentsService.updateShipment(this.model.uid, shipmentStatusesEnum.ShipmentCancelled);

    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    this.showErrorModalAndRedirect('Order and Shipment were canceled, redirecting to dashboard...', 'Order and Shipment Cancelled', {tag:'dashboard'}, 2000);
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

    this.onTagClick('manage-kits', async(model) => {
          this.navigateToPageTag('study-kits', {
                studyId: model.shipmentModel.shipment.studyId,
                orderId: model.shipmentModel.shipment.orderId
          });
    });
  }

  scanShipmentHandler() {
    this.onTagClick('scan-shipment', () => {
      console.log(this.model.shipmentModel.shipment.uid);
      this.navigateToPageTag('scan-shipment', {
        shipment: {
          shipmentUID:this.model.shipmentModel.shipment.uid,
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
    let { uid } = this.history.location.state;
    model.uid = uid;

    model.shipmentModel.shipment = await this.shipmentsService.getShipment(model.uid);
    model.shipmentModel.shipment = { ...this.transformShipmentData(model.shipmentModel.shipment) };
    if (model.shipmentModel.shipment.shipmentComments) {
      model.shipmentModel.shipment.comments = await this.getShipmentComments(model.shipmentModel.shipment);
    }

    model.actions = this.setShipmentActions(model.shipmentModel.shipment);

    if([ Roles.CMO,Roles.Sponsor].indexOf(this.role)!==-1){
      model.orderModel.order = await this.ordersService.getOrder(model.shipmentModel.shipment.orderSSI);
      model.orderModel.order = { ...this.transformOrderData(model.orderModel.order) };
    }
    else{
      model.orderModel.order = { ...this.transformOrderData(model.shipmentModel.shipment) };
    }


    //SPONSOR, CMO, has kitsIDSSI in the order, SITE has it in shipment
    let kitsSSI;
    if(this.role === Roles.Site){
      kitsSSI = model.shipmentModel.shipment.kitIdSSI;
    }
    else{
      kitsSSI = model.orderModel.order.kitsSSI
    }

    model.kitsData = { kitsSSI: kitsSSI};
    model.documents = [];
    if (model.orderModel.order.documents) {
      model.documents = model.documents.concat(model.orderModel.order.documents);
    }
    if (model.shipmentModel.shipment.documents) {
      model.documents = model.documents.concat(model.shipmentModel.shipment.documents);
    }

    if (model.shipmentModel.shipment.receivedDSUKeySSI) {
      const receivedDSU = await this.shipmentService.getShipmentReceivedDSU(model.shipmentModel.shipment.receivedDSUKeySSI);
      model.shipmentModel = { ...model.shipmentModel, ...JSON.parse(JSON.stringify(receivedDSU)) };
      model.shipmentModel.receivedDate = momentService(model.shipmentModel.receivedDateTime).format(Commons.YMDDateTimeFormatPattern);
      model.shipmentModel.receivedTime = momentService(model.shipmentModel.receivedDateTime).format(Commons.HourFormatPattern);
      //TODO check this again if is needed after implementation of #378
      if (this.role === Roles.Site) {
        model.shipmentModel.kits = await this.kitsService.getKitIdsDsu(model.shipmentModel.shipment.kitIdSSI);
        model.shipmentModel.isShipmentReceived = true;
      }
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
