const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const viewModelResolver = cscServices.viewModelResolver;
const { kitsStatusesEnum } = cscServices.constants.kit;
const eventBusService = cscServices.EventBusService;
const { Topics } = cscServices.constants;
const FileDownloaderService = cscServices.FileDownloaderService;

class ConfirmKitDestructionController extends WebcController {

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

    this.on('add-certification-of-destruction-file', (event) => {
      this.certificationOfDestructionFile = event.data[0];
      this.model.kitModel.form.certificationOfDestruction.name = this.certificationOfDestructionFile.name;
    });

    this.onTagEvent('step-1', 'click', () => {
      this.makeStepActive('step-1', 'step-1-wrapper');
    });

    this.onTagEvent('step-2', 'click', () => {
      this.makeStepActive('step-2', 'step-2-wrapper');
    });

    this.onTagEvent('from_step_1_to_2', 'click', () => {
      this.makeStepActive('step-2', 'step-2-wrapper');
    });

  }

  makeStepActive(stepId, stepHolderId) {
    this.model.wizard.forEach((item) => {
      this.querySelector('#' + item.id).classList.remove('step-active');
      this.hideStep(item.holder_id);
    });

    this.querySelector('#' + stepId).classList.add('step-active');
    this.showStep(stepHolderId);
  }

  showStep(item) {
    const el = document.getElementById(item);
    if (el) {
      el.classList.remove('step-hidden');
    }
  }

  hideStep(item) {
    const el = document.getElementById(item);
    if (el) {
      el.classList.add('step-hidden');
    }
  }

  getWizardForm() {
    return [
      { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Shipment Details', visible: true, validated: false },
      { id: 'step-2', holder_id: 'step-2-wrapper', name: 'Confirmation' }
    ];
  }

  async initViewModel() {
    let { studyId, orderId, uid, kitId } = this.history.location.state.kit;

    this.model = {
      isSubmitting:false,
      kitModel: viewModelResolver('kit'),
      studyId: studyId,
      orderId: orderId,
      uid: uid,
      kitId: kitId
    };

    this.model.wizard = this.getWizardForm();
    this.model.formIsInvalid = true;

    this.model.addExpression(
      "isCertificationOfDestructionFileEmpty",
      () => {
        return this.model.kitModel.form.certificationOfDestruction === null;
      },
      "kitModel.form.certificationOfDestruction"
    );

  }

  initHandlers() {

    this.model.onChange('kitModel.form', this.checkFormValidity.bind(this));

    this.onTagEvent('confirm-kit-destruction', 'click', (e) => {
      this.confirmKitDestruction();
    });

    this.onTagEvent('form_reset', 'click', (e) => {
      this.showModal(
        'All newly entered data will be removed. This will require you to start over the process of entering the details again',
        'Clear Changes',
        () => {
          this.model.kitModel = viewModelResolver('kit'),
            this.certificationOfDestructionFile = null;
          this.makeStepActive('step-1', 'step-1-wrapper', e);
          this.model.formIsInvalid = true;
        },
        () => {
        },
        {
          disableExpanding: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Ok, let\'s start over',
          id: 'confirm-modal'
        }
      );
    });



    this.onTagClick('download-file', async () => {
      if(this.certificationOfDestructionFile != null){
        let fileDownloaderService = new FileDownloaderService();
        window.WebCardinal.loader.hidden = false;
        await fileDownloaderService.prepareDownloadFromBrowser(this.certificationOfDestructionFile);
        fileDownloaderService.downloadFileToDevice(this.certificationOfDestructionFile.name);
        window.WebCardinal.loader.hidden = true;
      }
    });

  }

  checkFormValidity(){

    const requiredInputs = [
      this.model.kitModel.form.destructionFacilityProvider.value,
      this.model.kitModel.form.responsiblePerson.value,
      this.model.kitModel.form.dateOfDestruction.value,
      this.model.kitModel.form.destructionComment.value
    ]

    let validationConstraints = [
      ...requiredInputs.map(input => typeof input !== 'undefined' && input.trim() !== "")
    ];

    this.model.formIsInvalid = typeof (validationConstraints.find(val => val !== true)) !== 'undefined';
  }

  async confirmKitDestruction() {
    window.WebCardinal.loader.hidden = false;
    this.model.isSubmitting = true;

    const destroyedConfirmationData = {
      kitDestroyDetails : this.getDestroyedConfirmationData()
    };

    if (this.certificationOfDestructionFile) {
      await this.kitsService.addCertificationOfDestruction(this.certificationOfDestructionFile, this.model.uid);
      destroyedConfirmationData.kitDestroyDetails.certificationOfDestructionName = this.certificationOfDestructionFile.name;
    }

    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.Destroyed, destroyedConfirmationData);

    eventBusService.dispatchEvent(Topics.RefreshKits, null);
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
