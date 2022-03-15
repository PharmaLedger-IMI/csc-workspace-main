const { ViewShipmentBaseController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentsService = cscServices.ShipmentService;
const { Roles } = cscServices.constants;
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
    this.shipmentsService = new ShipmentsService(this.DSUStorage);
  }

  attachEventListeners() {
    this.showHistoryHandler();
    this.toggleAccordionItemHandler();
    this.downloadAttachmentHandler();
    this.navigationHandlers();

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
    model.shipmentModel.shipment = shipment;

    if (model.shipmentModel.shipment.shipmentComments) {
      model.shipmentModel.shipment.comments = await this.getShipmentComments(model.shipmentModel.shipment);
    }

    if (model.shipmentModel.shipment.shipmentDocuments) {
      model.shipmentModel.shipment.documents = await this.getShipmentDocuments(model.shipmentModel.shipment);
    }

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
}

export default CourierSingleShipmentController;
