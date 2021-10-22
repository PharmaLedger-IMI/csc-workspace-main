const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const viewModelResolver = cscServices.viewModelResolver;
const { shipmentStatusesEnum } = cscServices.constants.shipment;
const momentService = cscServices.momentService;
const { Commons } = cscServices.constants;
const {kitsStatusesEnum, kitsPendingActionEnum} = cscServices.constants.kit;

class SiteSingleKitController extends WebcController {

  constructor(...props) {
    super(...props);

    this.kitsService = new KitsService(this.DSUStorage);
    this.initViewModel();
    this.openFirstAccordion();
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.toggleAccordionItemHandler();
  }

  attachSiteEventHandlers(){
    this.onTagClick('manage-kit', () => {
      this.navigateToPageTag('scan-kit', {
        kit: {
          kitId: this.model.kitModel.kit.kitId,
          ...this.model.toObject('kitModel.kit')
        }
      });
    });

    this.onTagClick('assign-kit', () => {
      this.navigateToPageTag('scan-kit', {
        kit: {
          kitId: this.model.kitModel.kit.kitId,
          ...this.model.toObject('kitModel.kit')
        }
      });
    });
  }
  

  async initViewModel() {
    const model = {
      kitModel: viewModelResolver('kit')
    };

    let { keySSI } = this.history.location.state;
    model.keySSI = keySSI;
    model.kitModel.kit = await this.kitsService.getKitDetails(model.keySSI);
    model.kitModel.kit = { ...this.transformKitData(model.kitModel.kit) };

    if (model.kitModel.kit.shipmentComments) {
      model.kitModel.kit.comments = this.getShipmentComments(model.kitModel.kit);
    }
    model.actions = this.setKitActions(model.kitModel.kit);
    this.model = model;
  }

  setKitActions(kit) {
    const actions = {};
    actions.canAssignKit = kit.status_value === kitsStatusesEnum.AvailableForAssignment;
    actions.canManageKit = kit.status_value === kitsStatusesEnum.Received;
    this.attachSiteEventHandlers();
    return actions;
  }

  getShipmentComments(kit) {
    let comments = kit.shipmentComments;
    comments.forEach((comment) => {
      comment.date = momentService(comment.date).format(Commons.DateTimeFormatPattern);
    });
    return comments;
  }

  getDateTime(timestamp) {
    return {
      date: momentService(timestamp).format(Commons.YMDDateTimeFormatPattern),
      time: momentService(timestamp).format(Commons.HourFormatPattern)
    };
  }

  transformKitData(data) {
    if (data) {
      data.status_value = data.status.sort((function (a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].status;

      if (data.status_value === shipmentStatusesEnum.Received) {
        data.status_value = shipmentStatusesEnum.Received;
      }

      data.status_date = momentService(data.status.sort((function (a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].date).format(Commons.DateTimeFormatPattern);

      if (data.receivedDateTime) {
        data.receivedDateTime = this.getDateTime(data.receivedDateTime)
      }

      data.pending_action = this.getPendingAction(data.status_value);
      return data;
    }
    return {};
  }

  getPendingAction(status_value) {
    switch (status_value) {
      case kitsStatusesEnum.Received:
        return kitsPendingActionEnum.ManageKit;
      case kitsStatusesEnum.AvailableForAssignment:
        return kitsPendingActionEnum.Assign;
      case kitsStatusesEnum.Assigned:
        return kitsPendingActionEnum.Administer;
    }

    return kitsPendingActionEnum.NoFurtherActionsRequired;
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
export default SiteSingleKitController;