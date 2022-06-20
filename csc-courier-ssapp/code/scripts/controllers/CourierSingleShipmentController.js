const { ViewShipmentBaseController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentsService = cscServices.ShipmentService;
const momentService = cscServices.momentService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics,Commons } = cscServices.constants;
const { shipmentStatusesEnum } = cscServices.constants.shipment;

class CourierSingleShipmentController extends ViewShipmentBaseController {
  constructor(...props) {
    super(Roles.Courier,...props);
    this.initServices().then(() => {
      this.initViewModel();
      this.openFirstAccordion();
      this.attachEventListeners();
    });
  }

  async initServices(){
    this.shipmentsService = new ShipmentsService();
  }

  attachEventListeners() {
    this.showHistoryHandler();
    this.toggleAccordionItemHandler();
    this.downloadAttachmentHandler();
    this.navigationHandlers();

    this.onTagClick('request-update-pickup-details',this.requestUpdatePickupDetails.bind(this));

    this.onTagClick('scan-shipment-pickup', () => {
        this.navigateToPageTag('scan-shipment-pickup', {
            shipment: {
               shipmentId: this.model.shipmentModel.shipment.shipmentId,
                ...this.model.toObject('shipmentModel.shipment')
            }
            });
       });

    this.onTagEvent('edit-shipment', 'click', () => {
      this.navigateToPageTag('edit-shipment', {
        shipment: this.model.toObject('shipmentModel.shipment'),
        role: Roles.Courier
      });
    });

    this.onTagEvent('report-wrong-delivery-address', 'click', (e) => {
      this.reportWrongDeliveryAddress();
    });

    this.onTagClick('deliver-shipment', () => {
      this.navigateToPageTag('deliver-shipment', {
        shipment: {
          shipmentId: this.model.shipmentModel.shipment.shipmentId,
          ...this.model.toObject('shipmentModel.shipment')
        }
      });
    });
  }

  setShipmentActions(shipment) {
    const actions = {
      canPickupShipment:false,
      canEditShipment:false,
      canDeliverShipment:false,
      canReportWrongDeliveryAddress:false
    };

    switch (shipment.status[0].status) {
      case shipmentStatusesEnum.ReadyForDispatch:
        actions.canPickupShipment = true;
        break;
      case shipmentStatusesEnum.PickUpAtWarehouse:
        actions.canEditShipment = true;
        break;
      case shipmentStatusesEnum.InTransit:
        actions.canDeliverShipment = true;
        actions.canReportWrongDeliveryAddress = true;
        break;
    }
    return actions;
  }

  async initViewModel() {
    const model = {
      shipmentModel: viewModelResolver('shipment'),
    };

    //all fields are disabled
    for (let prop in model.form) {
      model.form[prop].disabled = true;
    }
    let { uid } = this.history.location.state;
    model.uid = uid;
    let shipment = await this.shipmentsService.getShipment(model.uid);
    shipment = { ...this.transformShipmentData(shipment) };

    if (shipment.shipmentComments) {
      shipment.comments = await this.getShipmentComments(shipment);
    }

    if (shipment.shipmentDocuments) {
      shipment.documents = await this.getShipmentDocuments(shipment);
    }


    shipment.hasPickupDateTimeChangeRequest = typeof shipment.pickupDateTimeChangeRequest !== 'undefined';
    if (shipment.hasPickupDateTimeChangeRequest) {
      shipment.hasPickupDateTimeChangeRequest = true;
      shipment.pickupDateTimeChangeRequest.requestPickupDateTime =  momentService(shipment.pickupDateTimeChangeRequest.requestPickupDateTime).format(Commons.DateTimeFormatPattern);
      shipment.pickupDateTimeChangeRequest.date =  momentService(shipment.pickupDateTimeChangeRequest.date).format(Commons.DateTimeFormatPattern);
    }

    model.shipmentModel.shipment = shipment;
    model.actions = this.setShipmentActions(model.shipmentModel.shipment);
    this.model = model;
    this.attachRefreshListeners();
  }

  reportWrongDeliveryAddress(){
    this.createWebcModal({
      template: 'wrongDeliveryAddress',
      model:this.model,
      controller: 'WrongDeliveryAddressModalController',
      disableBackdropClosing: true,
      disableFooter: true,
      disableHeader: true,
      disableExpanding: true,
      disableClosing: false,
      disableCancelButton: true,
      expanded: false,
      centered: true,
    });
  }

  requestUpdatePickupDetails(){
    this.model.pickupDateTimeChangeRequest = {
      pickupDateTime: {
        date:"",
        time:""
      },
      reason: '',
      incompleteRequest: true
    };
    this.showModalFromTemplate('requestUpdatePickupDetails', this.sendPickupDetailsRequest.bind(this), () => {
    }, {
      controller:"PickupDetailsRequestController",
      disableExpanding: true,
      disableBackdropClosing: true,
      model: this.model
    });
  }

  async sendPickupDetailsRequest() {
    window.WebCardinal.loader.hidden = false;
    const requestPickupDateTime = momentService(this.model.pickupDateTimeChangeRequest.pickupDateTime.date + ' ' + this.model.pickupDateTimeChangeRequest.pickupDateTime.time).valueOf();
    const pickupDateTimeChangeRequest = {
      shipmentSSI: this.model.shipmentModel.shipment.uid,
      requestPickupDateTime: requestPickupDateTime,
      reason: this.model.pickupDateTimeChangeRequest.reason
    };

    await this.shipmentsService.sendNewPickupDetailsRequest(this.model.shipmentModel.shipment.cmoId, pickupDateTimeChangeRequest);
    eventBusService.dispatchEvent(Topics.RefreshShipments + this.model.shipmentModel.shipment.shipmentId, null);
    window.WebCardinal.loader.hidden = true;

  }
}

export default CourierSingleShipmentController;
