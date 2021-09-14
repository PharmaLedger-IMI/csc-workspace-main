const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const { shipmentStatusesEnum, shipmentPendingActionEnum } = cscServices.constants.shipment;
const { Commons } = cscServices.constants;
const momentService = cscServices.momentService;

class CourierSingleShipmentController extends WebcController {
  constructor( ...props) {
    super(...props);
    let communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.COU_IDENTITY);
    this.shipmentsService = new ShipmentsService(this.DSUStorage, communicationService);
    this.initViewModel();
    this.openFirstAccordion();
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.onTagClick('scan-pickup-shipment', () => {
      alert("Not implemented");
    });
  }

  async initViewModel() {
    const model = viewModelResolver('shipment');
    //all fields are disabled
    for (let prop in model.form) {
      model.form[prop].disabled = true;
    }
    let { keySSI } = this.history.location.state;
    model.keySSI = keySSI;
    model.shipment = await this.shipmentsService.getShipment(model.keySSI);
    model.shipment = { ...this.transformShipmentData(model.shipment) };
    console.log(model);
    this.model = model;
  }

  transformShipmentData(data) {
    if (data) {
      data.status_value = data.status.sort((function(a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].status;
      if (data.status_value === shipmentStatusesEnum.ShipmentCancelled) {
        data.status_value = shipmentStatusesEnum.Cancelled;
      }

      data.status_date = momentService(data.status.sort((function(a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].date).format(Commons.DateTimeFormatPattern);

      const normalStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch];
      const approvedStatuses = [shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered, shipmentStatusesEnum.Received];
      data.status_approved = approvedStatuses.indexOf(data.status_value) !== -1;
      data.status_cancelled = data.status_value === shipmentStatusesEnum.Cancelled;
      data.status_normal = normalStatuses.indexOf(data.status_value) !== -1;
      data.pending_action = this.getPendingAction(data.status_value);

      return data;
    }

    return {};
  }

  getPendingAction(status_value) {
    switch (status_value) {
      case shipmentStatusesEnum.InPreparation:
        return shipmentPendingActionEnum.PendingReadyForDispatch;

      case shipmentStatusesEnum.ReadyForDispatch:
        return shipmentPendingActionEnum.PendingPickUp;

      case shipmentStatusesEnum.InTransit:
        return shipmentPendingActionEnum.PendingDelivery;

      case shipmentStatusesEnum.Delivered:
        return shipmentPendingActionEnum.PendingReception;

      case shipmentStatusesEnum.Received:
        return shipmentPendingActionEnum.ManageKits;
    }

    return '-';
  }

  openFirstAccordion() {
    const accordion = this.querySelector('.accordion-item');
    const targetIcon = accordion.querySelector('.accordion-icon');
    const panel = accordion.nextElementSibling;

    accordion.classList.toggle('accordion-item-active');
    targetIcon.classList.toggle('rotate-icon');
    panel.style.maxHeight = '1000px';
  }
}
export default CourierSingleShipmentController;