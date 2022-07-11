const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const KitsService = cscServices.KitsService;
const eventBusService = cscServices.EventBusService;
const {  Topics } = cscServices.constants;
const { kitsStatusesEnum } = cscServices.constants.kit;


class AssignKitController extends WebcController {

  constructor(...props) {
    super(...props);
    this.originalKit = this.history.location.state.kit;
    let { studyId, orderId, uid, kitId } = this.history.location.state.kit;
    this.kitsService = new KitsService();
    this.model = { kitModel: viewModelResolver('kit') };
    this.model.kit = this.originalKit;
    this.model.studyId = studyId;
    this.model.orderId = orderId;
    this.model.uid = uid;
    this.model.kitId = kitId;
    console.log("originalKit " + JSON.stringify(this.model.kit));

    this.initHandlers();
    this.navigationHandlers();
  }

  initHandlers() {
    this.onTagEvent('assign-kit', 'click', (e) => {
      this.sign();
    });
  }

  async sign() {
    this.model.disableSign = true;
    window.WebCardinal.loader.hidden = false;
    
    await this.kitsService.updateKit(this.model.kit.uid, kitsStatusesEnum.Assigned, {
      investigatorId: this.model.kitModel.form.investigatorId.value
    });
    eventBusService.dispatchEvent(Topics.RefreshKits, null);

    this.showErrorModalAndRedirect('Kit is marked as assigned', 'Kit Assigned', { tag: 'kit', state: { uid: this.model.kit.uid } }, 2000);

    window.WebCardinal.loader.hidden = true;
  }

  navigationHandlers() {
    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Shipment });
    });

    this.onTagClick('kits-management', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Kits });
    });

    this.onTagClick('view-study-kits', () => {
      this.navigateToPageTag('study-kits', {
        studyId: this.model.studyId,
        orderId: this.model.orderId
      });
    });

    this.onTagClick('view-kit', () => {
      this.navigateToPageTag('kit', { uid: this.model.uid });
    });

  }

}

export default AssignKitController;