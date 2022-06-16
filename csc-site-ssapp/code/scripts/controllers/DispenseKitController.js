const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const DidService = cscServices.DidService;
const KitsService = cscServices.KitsService;
const viewModelResolver = cscServices.viewModelResolver;
const { kitsStatusesEnum } = cscServices.constants.kit;
const eventBusService = cscServices.EventBusService;
const { Topics } = cscServices.constants;

class DispenseKitController extends WebcController {

  constructor(...props) {
    super(...props);
    this.kitsService = new KitsService();
    this.initViewModel();
    this.initHandlers();
    this.navigationHandlers();
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

  async initViewModel() {
    let { studyId, orderId, uid, kitId } = this.history.location.state.kit;

    this.model = {
      kitModel: viewModelResolver('kit'),
      studyId: studyId,
      orderId: orderId,
      uid: uid,
      kitId: kitId,
    };

    let didService = DidService.getDidServiceInstance();
    this.model.kitModel.form.dispensingPartyId.value = await didService.getDID();
  }

  initHandlers() {
    this.onTagEvent('dispense-kit', 'click', (e) => {
      this.dispenseKit();
    });
  }

  async dispenseKit() {
    window.WebCardinal.loader.hidden = false;

    const dispensedData = this.getDispensedData();
    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.Dispensed, dispensedData);

    eventBusService.emitEventListeners(Topics.RefreshKits, null);
    this.showErrorModalAndRedirect('Kit is marked as dispensed', 'Kit Dispensed', {
      tag: 'kit',
      state: { uid: this.model.uid }
    }, 2000);
    window.WebCardinal.loader.hidden = true;
  }

  getDispensedData() {
    return {
      patientId: this.model.kitModel.form.patientId.value,
      doseType: this.model.kitModel.form.doseType.value,
      doseUom: this.model.kitModel.form.doseUom.value,
      doseVolume: this.model.kitModel.form.doseVolume.value,
      visitId: this.model.kitModel.form.visitId.value,
      dispensingPartyId: this.model.kitModel.form.dispensingPartyId.value,
      receivedDate: this.model.kitModel.form.receivedDate.value,
      receivedTime: this.model.kitModel.form.receivedTime.value
    };
  }
}

export default DispenseKitController;
