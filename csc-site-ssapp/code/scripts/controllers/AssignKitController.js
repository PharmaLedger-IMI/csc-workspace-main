const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const KitsService = cscServices.KitsService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const {  Topics } = cscServices.constants;
const { kitsStatusesEnum } = cscServices.constants.kit;


class AssignKitController extends WebcController {

  constructor(...props) {
    super(...props);
    this.originalKit = this.history.location.state.kit;
    let communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.SITE_IDENTITY);
    this.kitsService = new KitsService(this.DSUStorage, communicationService);
    this.model = { kitModel: viewModelResolver('kit') };
    this.model.kit = this.originalKit;
    console.log("originalKit " + JSON.stringify(this.model.kit));

    this.initHandlers();
  }

  initHandlers() {
    this.onTagEvent('assign-kit', 'click', (e) => {
      this.sign();
    });
  }

  async sign() {
    this.model.disableSign = true;
    window.WebCardinal.loader.hidden = false;
    
    await this.kitsService.updateKit(this.model.kit.keySSI, kitsStatusesEnum.Assigned, {
      investigatorId: this.model.kitModel.form.investigatorId.value
    });
    eventBusService.emitEventListeners(Topics.RefreshKits, null);

    this.showErrorModalAndRedirect('Kit is marked as assigned', 'Kit Assigned', { tag: 'kit', state: { keySSI: this.model.kit.keySSI } }, 2000);

    window.WebCardinal.loader.hidden = true;
  }

}

export default AssignKitController;