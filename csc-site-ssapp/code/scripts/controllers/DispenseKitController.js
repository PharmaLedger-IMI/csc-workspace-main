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
    this.model.formIsInvalid = true;
    this.validationConstraints = ["patientId","doseType","doseUom","doseVolume","visitId","dispensingPartyId","kitStorageCondition"];

    this.initViewModel();
    this.initHandlers();
    this.initStepperNavigationHandlers();
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

  fillKitModel = async () =>{
    let kitModel = viewModelResolver('kit');
    let didService = DidService.getDidServiceInstance();
    kitModel.form.dispensingPartyId.value = await didService.getDID();
    return kitModel;
  }

  async initViewModel() {
    let { studyId, orderId, uid, kitId } = this.history.location.state.kit;

    this.model = {
      kitModel: await this.fillKitModel(),
      studyId: studyId,
      orderId: orderId,
      uid: uid,
      kitId: kitId,
    };

    this.model.wizard_form = [
      { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Add Details', visible: true, validated: false },
      { id: 'step-2', holder_id: 'step-2-wrapper', name: 'Submit', visible: false, validated: false, },
    ];
    this.model.wizard_form_navigation = [
      { id: 'from_step_1_to_2', name: 'Next', visible: true, validated: false },
      { id: 'from_step_2_to_1', name: 'Previous', visible: true, validated: false },
    ];

    for(let i = 0; i<this.validationConstraints.length; i++){
      let input = this.validationConstraints[i];
      this.model.onChange(`kitModel.form.${input}`,this.checkFormValidity.bind(this));
    }
    this.model.submitButtonDisabled = false;
  }

  checkFormValidity(){
    for(let i = 0; i<this.validationConstraints.length; i++){
      let input = this.validationConstraints[i];
      if(this.model.kitModel.form[input].required && this.model.kitModel.form[input].value.trim() === ""){
        this.model.formIsInvalid = true;
        return;
      }
    }
    this.model.formIsInvalid = false;
  }
  initHandlers() {
    this.onTagEvent('dispense-kit', 'click', (e) => {
      this.dispenseKit();
    });

    this.onTagEvent('form-reset', 'click', (e) => {
      this.showModal(
        'All newly entered data will be removed. This will require you to start over the process of entering the details again',
        'Clear Changes',
       async () => {
          this.model.kitModel =  await this.fillKitModel();

          this.makeStepActive('step-1', 'step-1-wrapper', e);
        },
        this.cancelModalHandler,
        {
          disableExpanding: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Ok, let\'s start over',
          id: 'confirm-modal'
        }
      );
    });

  }

  initStepperNavigationHandlers() {
    this.onTagEvent('step-1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('step-2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('from_step_1_to_2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('from_step_2_to_1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
      this.model.formIsInvalid = false;
    });

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

  async dispenseKit() {
    window.WebCardinal.loader.hidden = false;
    this.model.submitButtonDisabled = true;
    const dispensedData = this.getDispensedData();
    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.Dispensed, dispensedData);

    eventBusService.dispatchEvent(Topics.RefreshKits, null);
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
      kitStorageCondition: this.model.kitModel.form.kitStorageCondition.value
    };
  }

}

export default DispenseKitController;
