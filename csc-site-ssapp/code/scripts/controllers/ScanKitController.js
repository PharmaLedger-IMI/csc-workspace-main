const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const KitsService = cscServices.KitsService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics } = cscServices.constants;
const { kitsStatusesEnum } = cscServices.constants.kit;


class ScanKitController extends WebcController {

  constructor(...props) {
    super(...props);
    this.originalKit = this.history.location.state.kit;
    let communicationService = CommunicationService.getInstance(Roles.Site);
    this.kitsService = new KitsService(this.DSUStorage, communicationService);
    this.model = { kitModel: viewModelResolver('kit') };
    this.model.kit = this.originalKit;
    console.log("originalKit " + JSON.stringify(this.model.kit));
    this.model.disableSign = false;

    this.onTagEvent("start-scanner", 'click', () => {
      this.model.isScannerActive = true;
    });

    this.initScanViewModel();
    this.initStepperNavigationHandlers();
    this.addModelChangeHandlers();
  }

  addModelChangeHandlers() {
    this.model.onChange("scannedData", () => {
      let correctValue = this.model.kit.kitId;
      this.model.scanSuccess = this.model.scannedData === correctValue;
      this.model.formIsInvalid = !this.model.scanSuccess;
      this.model.isScannerActive = false;
    });
  }

  initStepperNavigationHandlers() {
    this.onTagEvent('step-1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('step-2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('step-3', 'click', (e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagEvent('from_step_1_to_2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('from_step_2_to_1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
      this.model.formIsInvalid = false;
    });

    this.onTagEvent('from_step_2_to_3', 'click', (e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagEvent('from_step_3_to_2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
      this.model.formIsInvalid = false;
    });

    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard');
    });

    this.onTagClick('view-kit', () => {
      this.navigateToPageTag('kit', { keySSI: this.model.kit.keySSI });
    });

    this.onTagClick('nav-back', () => {
      this.history.goBack();
    });
    
    this.onTagEvent('sign_button', 'click', (e) => {
      this.sign();
    });

  }

  async sign() {
    this.model.disableSign = true;
    window.WebCardinal.loader.hidden = false;
    let receivedComment = {
      date: new Date().getTime(),
      entity: Roles.Site,
      comment: this.model.kitModel.form.add_comment.value
    }

    await this.kitsService.updateKit(this.model.kit.keySSI, kitsStatusesEnum.AvailableForAssignment, {
      kitActualTemperatureObserved: this.model.kitModel.form.temperature.value,
      kitComment: receivedComment
    });

    eventBusService.emitEventListeners(Topics.RefreshKits, null);
    this.showErrorModalAndRedirect('Kit is marked as available for assignment', 'Kit Available', { tag: 'kit', state: { keySSI: this.model.kit.keySSI } }, 2000);

    window.WebCardinal.loader.hidden = true;
  }

  makeStepActive(step_id, step_holder_id, e) {
    if (e) {
      e.wizard_form.forEach((item) => {
        let element = document.getElementById(item.id);
        element.classList.remove('step-active');
        this.hideStep(item.holder_id);
      });

      document.getElementById(step_id).classList.add('step-active');
      this.showStep(step_holder_id);
    }
  }

  hideStep(item) {
    const el = document.getElementById(item);
    if (el) {
      el.classList.add('step-hidden');
    }
  }

  showStep(item) {
    const el = document.getElementById(item);
    if (el) {
      el.classList.remove('step-hidden');
    }
  }

  initScanViewModel() {
    this.model.wizard_form = [
      { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Scan Shipment', visible: true, validated: false },
      { id: 'step-2', holder_id: 'step-2-wrapper', name: 'Add Details', visible: false, validated: false, },
      { id: 'step-3', holder_id: 'step-3-wrapper', name: 'Confirmation', visible: false, validated: false },
    ];
    this.model.wizard_form_navigation = [
      { id: 'from_step_1_to_2', name: 'Next', visible: true, validated: false },
      { id: 'from_step_2_to_1', name: 'Previous', visible: true, validated: false },
      { id: 'from_step_2_to_3', name: 'Next', visible: true, validated: false },
      { id: 'from_step_3_to_2', name: 'Previous', visible: true, validated: false },
    ];
    this.model.isScannerActive = true;
    this.model.scannedData = '';
    this.model.scanSuccess = false;
  }
}

export default ScanKitController;