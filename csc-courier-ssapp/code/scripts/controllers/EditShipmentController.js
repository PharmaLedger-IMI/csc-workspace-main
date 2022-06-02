const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const ShipmentService = cscServices.ShipmentService;
const {Roles} = cscServices.constants;
const FileDownloaderService = cscServices.FileDownloaderService;
const viewModelResolver = cscServices.viewModelResolver;
const { uuidv4 } = cscServices.utils;

export default class EditShipmentController extends WebcController {
  files = [];
  constructor(...props) {
    super(...props);

    this.originalShipment = this.history.location.state.shipment;

    this.initServices().then(()=>{
      this.initViewModel();
      this.initFormValidation();
      this.attachEventHandlers();
    })
  }

  async initServices(){
    this.shipmentsService = new ShipmentService();
    this.FileDownloaderService = new FileDownloaderService();
  }

  initFormValidation(){
    // For form validation
    this.model.formValidation = {
      shipmentDetailsDisabled: true,
      submitDisabled: true
    };
  }

  attachEventHandlers() {
    this.attachNavigationHandlers();
    this.attachModelChangeHandlers();
    this.addFileHandler();
    this.attachFormActions();
  }


  addFileHandler() {
    this.on('add-file', (event) => {
      const files = event.data;

      if (files) {
        files.forEach((file) => {
          const uuid = uuidv4();
          this.files.push({ fileContent: file, uuid });
          this.model.form.documents.push({
            name: file.name,
            attached_by: this.role,
            date: new Date().toLocaleString(),
            link: '',
            uuid,
          });
        });
      }

      this.model.form.filesEmpty = (this.files.length === 0);

    });
    this.onTagClick('remove-file', (document) => {
      const fileIdx = this.files.findIndex((x) => x.uuid === document.uuid);
      this.files.splice(fileIdx, 1);
      let doc = this.model.form.documents.find((item) => item.uuid === document.uuid);
      let idx = this.model.form.documents.indexOf(doc);
      this.model.form.documents.splice(idx, 1);
      this.model.form.filesEmpty = (this.files.length === 0);
    });
    this.onTagClick('download-file', async (model, target, event) => {
      const uuid = target.getAttribute('data-custom') || null;
      if (uuid) {
          window.WebCardinal.loader.hidden = false;
          const file = this.files.find((x) => x.uuid === uuid);
          await this.FileDownloaderService.prepareDownloadFromBrowser(file.fileContent);
          this.FileDownloaderService.downloadFileToDevice(file.fileContent.name);
          window.WebCardinal.loader.hidden = true;
        }
    });
  }

  attachFormActions() {
    this.onTagEvent('form_reset', 'click', (e) => {
      let title = 'Clear Changes';
      let content = 'All newly entered data will be removed. You will have to start the edit process again';
      let confirmHandler = () => {
        this.model = this.initViewModel();
        this.files = [];
        this.makeStepActive('step-1', 'step-1-wrapper', e);
      };
      let modalOptions = {
        disableExpanding: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Ok, let\'s start over',
        id: 'confirm-modal'
      };

      this.showModal(content, title, confirmHandler, () => {}, modalOptions);
    });
    this.onTagClick('form_submit', () => {


      if (!this.isFormValidated("submit")) {
        return this.showErrorModal("Please fill-in bill number, HS code and mandatory documents!", "Invalid form", () => {}, () => {}, {
          disableCancelButton: true,
          confirmButtonText: 'Close',
        });
      }

      this.shipmentData = this.prepareShipmentData();

      let title = 'Submit edit';
      let content = 'Are you sure you want to submit the edit?';
      let modalOptions = {
        disableExpanding: true,
        cancelButtonText: 'No',
        confirmButtonText: 'Yes',
        id: 'confirm-modal'
      };

      this.showModal(content, title, this.onSubmitYesResponse.bind(this), () => {}, modalOptions);
    });
  }

  async onSubmitYesResponse() {
    window.WebCardinal.loader.hidden = false;
    let billingData = {...this.shipmentData.bill};
    let {uid}  = this.model.shipment;

    this.shipmentData.editComment.entity = '<' + Roles.Courier + '> (' +  this.model.shipment.courierId + ')';
    await this.shipmentsService.createAndMountShipmentTransitOtherDSUs(uid, billingData, this.shipmentData.documents, this.shipmentData.editComment);
    window.WebCardinal.loader.hidden = true;
    this.showErrorModalAndRedirect('Shipment Edited, redirecting to dashboard...', 'Shipment Edit', {
      tag: 'shipment',
      state: { uid: uid }
    }, 2000);
  }

  attachModelChangeHandlers() {
    this.model.onChange('form.add_comment.value', () => {
      let comment = this.model.form.add_comment.value;
      //TODO: where are the comments
      this.model.allComments = [...[]];
      if (comment) {
        this.model.allComments.push({
          entity:  '<' + Roles.Courier + '> (' +  this.model.shipment.courierId + ')',
          date: new Date().toLocaleString(),
          comment: comment,
        });
      }
    });

    // When Bill Number Changes
    this.model.onChange("form.billNumber.value", () => {
      // Disable Shipment Details if the form is invalid
      this.model.formValidation.shipmentDetailsDisabled = !this.isFormValidated("shipmentDetails");
    });

    // When Bill Number Changes
    this.model.onChange("form.hsCode.value", () => {
      // Disable Shipment Details if the form is invalid
      this.model.formValidation.shipmentDetailsDisabled = !this.isFormValidated("shipmentDetails");
    });
  }

  // Here you can validate the form by step or in the final submit
  isFormValidated( validateStep ){
    switch (validateStep) {
      case "shipmentDetails":
         return ((this.model.form.billNumber.value !== "") && ( this.model.form.hsCode.value !== ""));
      case "submit":
        return ((this.model.form.billNumber.value !== "") && ( this.model.form.hsCode.value !== ""));
    }

  }

  makeStepActive(stepId, stepHolderId) {
    this.model.wizard.forEach((item) => {
      this.querySelector('#' + item.id).classList.remove('step-active');
      this.hideStep(item.holder_id);
    });

    this.querySelector('#' + stepId).classList.add('step-active');
    this.showStep(stepHolderId);
  }

  attachNavigationHandlers() {
    this.onTagEvent('step-1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('step-2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('step-3', 'click', (e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagEvent('step-4', 'click', (e) => {
      this.makeStepActive('step-4', 'step-4-wrapper', e);
    });

    this.onTagEvent('from_step_1_to_2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('from_step_2_to_1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('from_step_2_to_3', 'click', (e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagEvent('from_step_3_to_2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('from_step_3_to_4', 'click', (e) => {
      this.makeStepActive('step-4', 'step-4-wrapper', e);
    });

		this.onTagClick('view-shipment', (model) => {
      this.navigateToPageTag('shipment', { uid: model.shipment.uid });
    });
		
		this.onTagClick('nav-back', () => {
			this.history.goBack();
		});

		this.onTagClick('dashboard', () => {
			this.navigateToPageTag('dashboard');
		});
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

  getWizardForm() {
    return [
      { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Shipment Details', visible: true, validated: false },
      { id: 'step-2', holder_id: 'step-2-wrapper', name: 'Add Documents', visible: false, validated: false },
      { id: 'step-3', holder_id: 'step-3-wrapper', name: 'Comments', visible: false, validated: false },
      { id: 'step-4', holder_id: 'step-4-wrapper', name: 'Confirmation', visible: false, validated: false },
    ];
  }

  async initViewModel() {
    this.model = viewModelResolver('shipment');

    // TODO: where are the comments?
    this.model.allComments = JSON.parse(JSON.stringify([]));
    // this.model.shipment = await this.shipmentsService.getShipment(this.model.keySSI);
	this.model.shipment = this.originalShipment;
    this.model.form.documents = [];
    this.model.wizard = this.getWizardForm();
    this.model.form.filesEmpty = true;


  }

  prepareShipmentData() {
    const { billNumber, hsCode } = this.model.toObject('form');
    const documents = this.files.filter((x) => x.fileContent instanceof File).map((x) => x.fileContent);
    const editComment = {
      entity:  '<' + Roles.Courier + '> (' +  this.model.shipment.courierId + ')',
      comment: this.model.form.add_comment.value,
      date: new Date().getTime(),
    };

    return {
      bill: { billNumber: billNumber.value, hsCode: hsCode.value },
      documents,
      editComment
    }
  }

  async downloadFile(filename, rootFolder, keySSI) {
    window.WebCardinal.loader.hidden = false;
    const path = rootFolder + '/' + keySSI + '/' + 'files';
    await this.FileDownloaderService.prepareDownloadFromDsu(path, filename);
    this.FileDownloaderService.downloadFileToDevice(filename);
    window.WebCardinal.loader.hidden = true;
  }
}
