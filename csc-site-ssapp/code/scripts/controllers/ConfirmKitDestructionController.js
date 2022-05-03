const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const viewModelResolver = cscServices.viewModelResolver;
const { kitsStatusesEnum } = cscServices.constants.kit;
const eventBusService = cscServices.EventBusService;
const { Topics } = cscServices.constants;

class ConfirmKitDestructionController extends WebcController {

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
      this.navigateToPageTag('kit', { uid: this.model.uid });
    });

    this.on('add-certification-of-destruction-file', (event) => {
      this.certificationOfDestructionFile = event.data[0];
      this.model.kitModel.form.certificationOfDestruction.name = this.certificationOfDestructionFile.name;
    });

  }

  async initViewModel() {
    let { studyId, orderId, uid, kitId } = this.history.location.state.kit;

    this.model = {
      kitModel: viewModelResolver('kit'),
      studyId: studyId,
      orderId: orderId,
      uid: uid,
      kitId: kitId
    };

  }

  initHandlers() {
    this.onTagEvent('confirm-kit-destruction', 'click', (e) => {
      this.confirmKitDestruction();
    });
  }

  async confirmKitDestruction() {
    window.WebCardinal.loader.hidden = false;

    const destroyedConfirmationData = {
      kitDestroyDetails : this.getDestroyedConfirmationData()
    };

    if (this.certificationOfDestructionFile) {
      const certificationOfDestructionFileDSU = await this.kitsService.addCertificationOfDestruction(this.certificationOfDestructionFile);
      destroyedConfirmationData.kitDestroyDetails.certificationOfDestructionSSI = certificationOfDestructionFileDSU.sReadSSI;
      destroyedConfirmationData.kitDestroyDetails.certificationOfDestructionName = this.certificationOfDestructionFile.name;
    }

    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.Destroyed, destroyedConfirmationData);

    eventBusService.emitEventListeners(Topics.RefreshKits, null);
    this.showErrorModalAndRedirect('Kit is marked as destroyed', 'Kit Destroyed', {
      tag: 'kit',
      state: { uid: this.model.uid }
    }, 2000);
    window.WebCardinal.loader.hidden = true;
  }

  getDestroyedConfirmationData() {
    return {
      destructionFacilityProvider: this.model.kitModel.form.destructionFacilityProvider.value,
      responsiblePerson: this.model.kitModel.form.responsiblePerson.value,
      dateOfDestruction: this.model.kitModel.form.dateOfDestruction.value,
      destructionComment: this.model.kitModel.form.destructionComment.value
    };
  }
}

export default ConfirmKitDestructionController;
