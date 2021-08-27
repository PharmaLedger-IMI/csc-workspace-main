const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const CommunicationService = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const { Topics, Roles, NotificationTypes, order, FoldersEnum } = cscServices.constants;
const { orderStatusesEnum } = order;
const FileDownloaderService = cscServices.FileDownloaderService;

const csIdentities = {};
csIdentities[Roles.Sponsor] = CommunicationService.identities.CSC.SPONSOR_IDENTITY;
csIdentities[Roles.CMO] = CommunicationService.identities.CSC.CMO_IDENTITY;

class ReviewOrderControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);

    this.role = role;
    this.originalOrder = this.history.location.state.order;
    let communicationService = CommunicationService.getInstance(csIdentities[role]);
    this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);
    this.ordersService = new OrdersService(this.DSUStorage, communicationService);
    this.notificationsService = new NotificationsService(this.DSUStorage);

    this.model = this.getReviewOrderViewModel(order);
    this.attachEventHandlers();
  }

  attachEventHandlers() {
    this.attachExpressionHandlers();
    this.attachModelChangeHandlers();
    this.addFileHandler();
    this.formSubmitHandler();
    this.formResetHandler();
    this.initStepperNavigationHandlers();
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
          this.FileDownloaderService.prepareDownloadFromBrowser(file);
          this.model.form.documents.push({
            name: file.name,
            attached_by: this.role,
            date: new Date().toLocaleString(),
            link: '',
            canRemove: true,
            file: file,
          });
        });
      }
    });

    this.onTagClick('remove-file', (event) => {
      this.model.form.documents.forEach((document) => {
        if (document.canRemove === true) {
          let idx = this.model.form.documents.indexOf(document);
          this.model.form.documents.splice(idx, 1);
        }
      });
    });

    this.onTagClick('download-file', (model, target, event) => {
      const filename = target.getAttribute('data-custom') || null;
      if (filename) {
        this.FileDownloaderService.downloadFileToDevice(filename);
      }
    });
  }

  formSubmitHandler() {
    this.onTagEvent('form_submit', 'click', (e) => {
      this.showErrorModal(
        new Error(`Are you sure you want to submit the review?`), // An error or a string, it's your choice
        'Submit Review',
        this.onSubmitYesResponse.bind(this),
        this.onSubmitNoResponse.bind(this),
        {
          disableExpanding: true,
          cancelButtonText: 'No',
          confirmButtonText: 'Yes',
          id: 'error-modal',
        }
      );
    });
  }

  async onSubmitYesResponse() {
    const orderStatus = this.role === Roles.Sponsor ? orderStatusesEnum.ReviewedBySponsor : orderStatusesEnum.ReviewedByCMO;
    const newFiles = this.model.form.documents.filter((doc) => typeof doc.file !== 'undefined').map((document) => document.file);
    const reviewComment = {
      entity: this.role,
      comment: this.model.form.inputs.add_comment.value,
      date: new Date().getTime(),
    };
    const result = await this.ordersService.updateOrderNew(this.model.order.keySSI, newFiles, reviewComment, this.role, orderStatus);
    const notification = {
      operation: NotificationTypes.UpdateOrderStatus,
      orderId: this.model.order.orderId,
      read: false,
      status: orderStatus,
      keySSI: this.model.order.keySSI,
      role: this.role,
      did: this.model.order.sponsorId,
      date: new Date().toISOString(),
    };

    await this.notificationsService.insertNotification(notification);
    eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
    eventBusService.emitEventListeners(Topics.RefreshOrders, null);

    this.createWebcModal({
      template: 'orderCreatedModal',
      controller: 'OrderCreatedModalController',
      model: result,
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

  onSubmitNoResponse() {
    console.log('Why not?');
  }

  formResetHandler() {
    this.onTagEvent('form_reset', 'click', () => {
      this.model = this.getReviewOrderViewModel();
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
        { id: 'step-4', holder_id: 'step-4-wrapper', name: 'Confirmation', visible: false, validated: false },
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
    this.prepareDocumentsDownloads(JSON.parse(JSON.stringify(model.order.documents)), model.order.cmoDocumentsKeySSI, model.order.sponsorDocumentsKeySSI);
    this.prepareKitsFileDownload(model.order.kitsFilename, model.order.kitsSSI);
    return model;
  }

  prepareKitsFileDownload(filename, keySSI) {
    let path = FoldersEnum.Kits + '/' + keySSI + '/' + 'files';
    this.FileDownloaderService.prepareDownloadFromDsu(path, filename);
  }

  prepareDocumentsDownloads(documents, cmoDocumentsKeySSI, sponsorDocumentsKeySSI) {
    if (documents && documents.length > 0) {
      documents.forEach((x) => {
        let path = null;
        if (x.attached_by === Roles.Sponsor) {
          path = FoldersEnum.Documents + '/' + sponsorDocumentsKeySSI + '/' + 'files';
        } else if (x.attached_by === Roles.CMO) {
          path = FoldersEnum.Documents + '/' + cmoDocumentsKeySSI + '/' + 'files';
        }

        if (path) {
          this.FileDownloaderService.prepareDownloadFromDsu(path, x.name);
        }
      });
    }
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ReviewOrderController', ReviewOrderControllerImpl);
