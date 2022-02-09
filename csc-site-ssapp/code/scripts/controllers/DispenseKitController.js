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
    this.kitsService = new KitsService(this.DSUStorage);
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
      this.navigateToPageTag('kit', { keySSI: this.model.kitSSI });
    });

  }

  async initViewModel() {
    let { studyId, orderId, keySSI, kitId } = this.history.location.state.kit;

    const model = {
      kitModel: viewModelResolver('kit'),
      userName: '',
      studyId: studyId,
      orderId: orderId,
      kitSSI: keySSI,
      kitId: kitId
    };


    let didService = DidService.getDidServiceInstance();
    didService.getUserDetails((err, userDetails) => {
      if (err) {
        return console.log('[UserDetails] [ERROR]', err);
      }
      model.userName = userDetails.username;
      this.model = model;
    });

  }

  initHandlers() {
    this.onTagEvent('dispense-kit', 'click', (e) => {
      this.dispenseKit();
    });
  }

  async dispenseKit() {
    window.WebCardinal.loader.hidden = false;

    const dispensedData = this.getDispensedData();
    await this.kitsService.updateKit(this.model.kitSSI, kitsStatusesEnum.Dispensed, dispensedData);

    eventBusService.emitEventListeners(Topics.RefreshKits, null);
    this.showErrorModalAndRedirect('Kit is marked as dispensed', 'Kit Dispensed', {
      tag: 'kit',
      state: { keySSI: this.model.kitSSI }
    }, 2000);
    window.WebCardinal.loader.hidden = true;
  }

  getDispensedData() {
    return {
      patientId: this.model.kitModel.form.patientId.value,
      doseType: this.model.kitModel.form.doseType.value,
      doseVolume: this.model.kitModel.form.doseVolume.value,
      visitId: this.model.kitModel.form.visitId.value,
      dispensingPartyId: this.model.kitModel.form.dispensingPartyId.value,
      receivedDate: this.model.kitModel.form.receivedDate.value,
      receivedTime: this.model.kitModel.form.receivedTime.value
    };
  }
}

export default DispenseKitController;
