const { ViewShipmentBaseController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics } = cscServices.constants;
const { shipmentStatusesEnum } = cscServices.constants.shipment;

class CourierSingleShipmentController extends ViewShipmentBaseController {
  constructor(...props) {
    super(...props);
    let communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.COU_IDENTITY);
    this.shipmentsService = new ShipmentsService(this.DSUStorage, communicationService);
    this.initViewModel();
    this.openFirstAccordion();
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.showHistoryHandler();
    this.toggleAccordionItemHandler();
    this.downloadAttachmentHandler();
    this.navigationHandlers();

    this.onTagEvent('edit-shipment', 'click', () => {
      this.navigateToPageTag('edit-shipment', {
        shipment: this.model.toObject('shipmentModel.shipment'),
        role: Roles.Courier
      });
    });
  }

  setShipmentActions(shipment) {
    const actions = {};
    
    if (shipment.status[0].status === shipmentStatusesEnum.ReadyForDispatch) {
      actions.canScanPickShipment = true;
      actions.canEditShipment = false;
    } else if (shipment.status[0].status === shipmentStatusesEnum.InTransit) {
      actions.canEditShipment = true;
      actions.canScanPickShipment = false;
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
    let { keySSI } = this.history.location.state;
    model.keySSI = keySSI;
    let shipment = await this.shipmentsService.getShipment(model.keySSI);
    shipment = { ...this.transformShipmentData(shipment) };
    model.shipmentModel.shipment = shipment;

    if (model.shipmentModel.shipment.shipmentComments) {
      model.shipmentModel.shipment.comments = await this.getShipmentComments(model.shipmentModel.shipment);
    }

    if(model.shipmentModel.shipment.shipmentDocuments){
      model.shipmentModel.shipment.documents = await this.getShipmentDocuments(model.shipmentModel.shipment);
    }

    model.actions = this.setShipmentActions(model.shipmentModel.shipment);
    console.log(model);
    this.model = model;
    this.attachRefresh();
  }

  attachRefresh() {
		eventBusService.addEventListener(Topics.RefreshShipments, async () => {
			let title = 'Shipment Updated';
			let content = 'Shipment was updated, New status is available';
			let modalOptions = {
				disableExpanding: true,
				confirmButtonText: 'Update View',
				id: 'confirm-modal'
			};

      this.showModal(content, title, this.initViewModel.bind(this), this.initViewModel.bind(this), modalOptions);
		});
  }
}

export default CourierSingleShipmentController;