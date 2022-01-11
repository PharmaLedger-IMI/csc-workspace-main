const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const {getCommunicationServiceInstance} = cscServices.CommunicationServiceNew;
const ProfileService = cscServices.ProfileService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const { Topics, Roles, order, FoldersEnum } = cscServices.constants;
const { orderStatusesEnum } = order;
const FileDownloaderService = cscServices.FileDownloaderService;
const { uuidv4 } = cscServices.utils;

class ReviewOrderControllerImpl extends WebcController {
  files = [];
  modalCancelHandler = ()=>{};

  constructor(role, ...props) {
    super(...props);
    this.initServices();

    this.role = role;
    this.originalOrder = this.history.location.state.order;
    this.model = this.getReviewOrderViewModel(order);
    this.attachEventHandlers();
  }

  async initServices(){
    this.profileService = ProfileService.getProfileServiceInstance();
    let did = await this.profileService.getDID();
    const didData = await ProfileService.getDidData(did);
    let communicationService = getCommunicationServiceInstance(didData)
    this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);
    this.ordersService = new OrdersService(this.DSUStorage, communicationService);
  }

  attachEventHandlers() {
    this.attachExpressionHandlers();
    this.attachModelChangeHandlers();
    this.navigationHandlers();
    this.addFileHandler();
    this.formSubmitHandler();
    this.formResetHandler();
    this.initStepperNavigationHandlers();
  }

  navigationHandlers() {
    this.onTagClick('nav-back', () => {
      this.history.goBack();
    });

    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Order });
    });

    this.onTagClick('view-order', () => {
      this.navigateToPageTag('order', { keySSI: this.model.order.keySSI });
    });
  }

  attachExpressionHandlers() {
    this.model.addExpression(
      'hasComments',
      () => {
        return this.model.form.comments.length >= 1;
      },
      'form.comments.length'
    );
  }

  attachModelChangeHandlers() {
    this.model.onChange('form.inputs.add_comment.value', () => {
      let comment = this.model.form.inputs.add_comment.value;
      this.model.allComments = [...this.model.order.comments];
      if (comment) {
        this.model.allComments.push({
          entity: this.role,
          date: new Date().toLocaleString(),
          comment: comment,
        });
      }
    });
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
            canRemove: true,
            uuid,
          });
        });
      }
    });

    this.onTagClick('remove-file', (document) => {
      if (document.canRemove === true) {
        const fileIdx = this.files.findIndex((x) => x.uuid === document.uuid);
        this.files.splice(fileIdx, 1);
        let doc = this.model.form.documents.find((item) => item.uuid === document.uuid);
        let idx = this.model.form.documents.indexOf(doc);
        this.model.form.documents.splice(idx, 1);
      }
    });

    this.onTagClick('download-file', async (model, target, event) => {
      const uuid = target.getAttribute('data-custom') || null;
      if (uuid) {
        if (model.canRemove) {
          window.WebCardinal.loader.hidden = false;
          const file = this.files.find((x) => x.uuid === uuid);
          await this.FileDownloaderService.prepareDownloadFromBrowser(file.fileContent);
          this.FileDownloaderService.downloadFileToDevice(file.fileContent.name);
          window.WebCardinal.loader.hidden = true;
        } else {
          const file = this.files.find((x) => x.uuid === uuid);
          const keySSI = file.fileContent.attached_by === Roles.Sponsor ? this.model.order.sponsorDocumentsKeySSI : this.model.order.cmoDocumentsKeySSI;
          await this.downloadFile(file.fileContent.name, FoldersEnum.Documents, keySSI);
        }
      }
    });

    this.onTagClick('download-kits-file', async (model, target, event) => {
      const filename = target.getAttribute('data-custom') || null;
      if (filename) {
        await this.downloadFile(filename, FoldersEnum.Kits, model.order.kitsSSI);
      }
    });
  }

  formSubmitHandler() {
    this.onTagEvent('form_submit', 'click', (e) => {
      let title = 'Submit review';
      let content = 'Are you sure you want to submit the review?';
      let modalOptions = {
        disableExpanding: true,
        cancelButtonText: 'No',
        confirmButtonText: 'Yes',
        id: 'confirm-modal'
      };

      this.showModal(content, title, this.onSubmitYesResponse.bind(this), this.modalCancelHandler, modalOptions);
    });
  }

  async onSubmitYesResponse() {
    window.WebCardinal.loader.hidden = false;
    const orderStatus = orderStatusesEnum.ReviewedByCMO;
    const newFiles = this.files.filter((x) => x.fileContent instanceof File).map((x) => x.fileContent);
    const reviewComment = {
      entity: this.role,
      comment: this.model.form.inputs.add_comment.value,
      date: new Date().getTime(),
    };
    const result = await this.ordersService.updateOrderNew(this.model.order.keySSI, newFiles, reviewComment, this.role, orderStatus);
    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    window.WebCardinal.loader.hidden = true;
    this.createWebcModal({
      template: 'orderCreatedModal',
      controller: 'OrderCreatedModalController',
      model: {modalTitle:"Review Order", ...result},
      disableBackdropClosing: false,
      disableFooter: true,
      disableHeader: true,
      disableExpanding: true,
      disableClosing: true,
      disableCancelButton: true,
      expanded: false,
      centered: true,
    });
  }

  formResetHandler() {
    this.onTagEvent('form_reset', 'click', (e) => {

      let title = 'Cancel Changes';
      let content = 'All newly entered data will be removed. You will have to start the review process again';
      let confirmHandler = () => {
        this.model = this.getReviewOrderViewModel();
        this.files = [];
        this.makeStepActive('step-1', 'step-1-wrapper', e);
      };
      let modalOptions = {
        disableExpanding: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Ok, let\'s start over',
        id: 'confirm-modal'
      };

      this.showModal(content, title, confirmHandler, this.modalCancelHandler, modalOptions);
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
  }

  makeStepActive(step_id, step_holder_id, e) {
    if (e) {
      e.wizard_form.forEach((item) => {
        document.getElementById(item.id).classList.remove('step-active');
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

  getDateTime() {
    return this.model.order.delivery_date.date + ' ' + this.model.order.delivery_date.time;
  }

  getTemperature() {
    return {
      min: this.model.order.temperatures.min,
      max: this.model.order.temperatures.max,
    };
  }

  getReviewOrderViewModel() {
    let model = {
      wizard_form: [
        { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Order Details', visible: true, validated: false },
        {
          id: 'step-2',
          holder_id: 'step-2-wrapper',
          name: 'Attach Documents',
          visible: false,
          validated: false,
        },
        { id: 'step-3', holder_id: 'step-3-wrapper', name: 'Comments', visible: false, validated: false },
        { id: 'step-4', holder_id: 'step-4-wrapper', name: 'Summary', visible: false, validated: false },
      ],
      wizard_form_navigation: [
        { id: 'from_step_1_to_2', name: 'Next', visible: true, validated: false },
        { id: 'from_step_2_to_1', name: 'Previous', visible: true, validated: false },
        { id: 'from_step_2_to_3', name: 'Next', visible: true, validated: false },
        { id: 'from_step_3_to_2', name: 'Previous', visible: true, validated: false },
        { id: 'from_step_3_to_4', name: 'Next', visible: true, validated: false },
      ],
      form: viewModelResolver('order').form,
      allComments: JSON.parse(JSON.stringify(this.originalOrder.comments)),
      order: JSON.parse(JSON.stringify(this.originalOrder)),
    };

    model = this.disableInputs(model);
    model = this.setDocuments(model);
    return model;
  }

  disableInputs(model) {
    // All fields are disabled
    for (let prop in model.form.inputs) {
      model.form.inputs[prop].disabled = true;
    }

    return model;
  }

  setDocuments(model) {
    model.form.documents = JSON.parse(JSON.stringify(this.originalOrder.documents));
    model.form.documents = model.form.documents.map((x) => ({ ...x, uuid: uuidv4() }));
    this.files = model.form.documents.map((x) => ({ fileContent: x, uuid: x.uuid }));
    return model;
  }

  async downloadFile(filename, rootFolder, keySSI) {
    window.WebCardinal.loader.hidden = false;
    const path = rootFolder + '/' + keySSI + '/' + 'files';
    await this.FileDownloaderService.prepareDownloadFromDsu(path, filename);
    this.FileDownloaderService.downloadFileToDevice(filename);
    window.WebCardinal.loader.hidden = true;
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ReviewOrderController', ReviewOrderControllerImpl);
