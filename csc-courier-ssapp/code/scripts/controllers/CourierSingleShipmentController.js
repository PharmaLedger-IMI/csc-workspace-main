const { ViewShipmentBaseController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const { Roles } = cscServices.constants;

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
    this.navigationHandlers();

    this.onTagEvent('edit-shipment', 'click', () => {
      this.navigateToPageTag('edit-shipment', {
        shipment: this.model.toObject('shipmentModel.shipment'),
        role: Roles.Courier
      });
    });
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
    console.log(model);
    this.model = model;
  }
}

export default CourierSingleShipmentController;
