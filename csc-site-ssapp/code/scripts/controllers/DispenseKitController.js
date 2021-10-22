const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const viewModelResolver = cscServices.viewModelResolver;
const { shipmentStatusesEnum, shipmentPendingActionEnum } = cscServices.constants.shipment;
const momentService = cscServices.momentService;
const { Commons } = cscServices.constants;

class DispenseKitController extends WebcController {

  constructor(...props) {
    super(...props);

    this.kitsService = new KitsService(this.DSUStorage);
    this.initViewModel();
//    this.openFirstAccordion();
//    this.attachEventListeners();
  }

  async initViewModel() {
    const model = {
      kitModel: viewModelResolver('kit')
    };
      let { studyId, orderId } = this.history.location.state;
      this.model.studyId = studyId;
      this.model.orderId = orderId;
//    let { keySSI } = this.history.location.state;
//    model.keySSI = keySSI;
//    model.kitModel.kit = await this.kitsService.getKitDetails(model.keySSI);

    this.model = model;
//    console.log("Kit Details", JSON.stringify(this.model));
  }

  getDateTime(timestamp) {
    return {
      date: momentService(timestamp).format(Commons.YMDDateTimeFormatPattern),
      time: momentService(timestamp).format(Commons.HourFormatPattern)
    };
  }

  getPendingAction(status_value) {
    switch (status_value) {
      case shipmentStatusesEnum.Received:
        return shipmentPendingActionEnum.ManageKits;
    }

    return '-';
  }

  toggleAccordionItemHandler() {
    this.onTagEvent('toggle-accordion', 'click', (model, target) => {
      const targetIcon = target.querySelector('.accordion-icon');
      target.classList.toggle('accordion-item-active');
      targetIcon.classList.toggle('rotate-icon');

      const panel = target.nextElementSibling;
      if (panel.style.maxHeight === '1000px') {
        panel.style.maxHeight = '0px';
      } else {
        panel.style.maxHeight = '1000px';
      }
    });
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
export default DispenseKitController;