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
    super(...props);
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
    this.scanShipmentHandler();
  }


  editShipmentHandler() {
    this.onTagClick('edit-shipment', () => {
      const modalConfiguration = {
        controller: 'EditShipmentController',
        disableExpanding: true,
        disableBackdropClosing: false,
        disableFooter: true,
        model: { keySSI: this.model.keySSI }
      };

      this.showModalFromTemplate('editShipment', this.confirmEditShipmentCallback, () => {
      }, modalConfiguration);
    });
  }

  confirmEditShipmentCallback = async (event) => {
    const shipmentDetails = event.detail;
    await this.shipmentsService.updateShipment(this.model.keySSI, shipmentStatusesEnum.ReadyForDispatch, shipmentDetails);
    this.showErrorModalAndRedirect('Shipment was edited, redirecting to dashboard...', 'Shipment Edited', '/', 2000);
  };

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
    const cancelShipmentStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch];
    switch(this.role) {
      case Roles.Sponsor: {
        actions.canCancelOrderAndShipment = cancelShipmentStatuses.indexOf(shipment.status_value) !== -1;
        this.attachSponsorEventHandlers();

        break;
      }

    }

    //Updates for #61
    if (shipment.status[0].status === shipmentStatusesEnum.InPreparation && !shipment.isShipmentScanSuccessful){
      actions.canScanShipment = true;
      actions.canEditShipment = false;
      actions.showDefaultKitsAccordianText = true;
    } else if(shipment.isShipmentScanSuccessful) {
      actions.canEditShipment = true;
      actions.canScanShipment = false;
      actions.showDefaultKitsAccordianText = false;
    } else {
      actions.canEditShipment = false;
      actions.canScanShipment = false;
      actions.showDefaultKitsAccordianText = true;
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
    const {keySSI} = this.model.order;
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

  scanShipmentHandler() {
    this.onTagClick('scan-shipment', () => {
        const modalConfiguration = {
          controller: 'ScanShipmentModalController',
          disableExpanding: true,
          disableBackdropClosing: false,
          disableFooter: true,
          model: {
            "shipmentId" : this.model.orderModel.order.orderId,
            "sponsorId" : this.model.orderModel.order.sponsorId,
            "studyId" : this.model.orderModel.order.studyId, 
            //"medicationListVersion" : "1.0",  // Source under discussion
            "kitsFilename": this.model.orderModel.order.kitsFilename,
            "kitsSSI" : this.model.orderModel.order.kitsSSI,              
            "kits" : this.model.orderModel.order.kits
          }
        }
        this.showModalFromTemplate('scanShipmentModal', this.confirmScanShipmentCallback, () => {}, modalConfiguration);
    })
  }

  confirmScanShipmentCallback = async(event) => {

    this.model.shipmentModel.shipment.isShipmentScanSuccessful = true;
    this.model.actions.canEditShipment = true;
    this.model.actions.canScanShipment = false;
    this.model.actions.showDefaultKitsAccordianText = false;

    const result = await this.shipmentsService.updateShipment(this.model.keySSI,
      shipmentStatusesEnum.InPreparation, this.model.shipmentModel.shipment);

    console.log('\n\n[UPDATE SHIPMENT AFTER SCAN]\n\n', JSON.stringify(result, null, 2));
  }

  async initViewModel() {
    const model = {
      orderModel: viewModelResolver('order'),
      shipmentModel: viewModelResolver('shipment')
    };
    //all fields are disabled
    for (let prop in model.orderModel.form.inputs) {
      model.orderModel.form.inputs[prop].disabled = true;
    }
    for (let prop in model.shipmentModel.form.inputs) {
      model.shipmentModel.form.inputs[prop].disabled = true;
    }

    let { keySSI } = this.history.location.state;
    model.keySSI = keySSI;

    model.shipmentModel.shipment = await this.shipmentsService.getShipment(model.keySSI);
    model.shipmentModel.shipment = { ...this.transformShipmentData(model.shipmentModel.shipment) };
    if(!('isShipmentScanSuccessful' in model.shipmentModel.shipment)) {
      model.shipmentModel.shipment.isShipmentScanSuccessful = false;
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

    this.model = model;
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('SingleShipmentController', SingleShipmentControllerImpl);
