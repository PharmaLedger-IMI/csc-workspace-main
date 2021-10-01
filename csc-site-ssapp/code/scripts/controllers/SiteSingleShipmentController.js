const { ViewShipmentBaseController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics } = cscServices.constants;
const { shipmentStatusesEnum } = cscServices.constants.shipment;

class SiteSingleShipmentController extends ViewShipmentBaseController {
  constructor(...props) {
    super(...props);
    let communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.SITE_IDENTITY);
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

    this.onTagClick('scan-shipment-received', () => {
      this.navigateToPageTag('scan-shipment-received', {
        shipment: {
          shipmentId: this.model.shipmentModel.shipment.shipmentId,
          ...this.model.toObject('shipmentModel.shipment')
        }
      });
    });
  }

  // setShipmentActions(shipment) {

  //   if (shipment.status[0].status == shipmentStatusesEnum.InTransit) {
  //     const actions = {
  //     canReceiveShipment: true
  //   };
  //   }

  //   return actions;
  // }

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

    if (model.shipmentModel.shipment.shipmentDocuments) {
      model.shipmentModel.shipment.documents = await this.getShipmentDocuments(model.shipmentModel.shipment);
    }

    // model.actions = this.setShipmentActions(model.shipmentModel.shipment);
    this.model = model;
  }
}
export default SiteSingleShipmentController;