const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const eventBusService = cscServices.EventBusService;
const { Topics, Roles, DocumentTypes } = cscServices.constants;
const OrdersService = cscServices.OrderService;
const CommunicationService = cscServices.CommunicationService;
const viewModelResolver = cscServices.viewModelResolver;
const FileDownloaderService = cscServices.FileDownloaderService;
const { uuidv4 } = cscServices.utils;

export default class NewOrderController extends WebcController {
  files = [];

  constructor(...props) {
    super(...props);
    let communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.SPONSOR_IDENTITY);
    this.ordersService = new OrdersService(this.DSUStorage, communicationService);
    this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);

    this.model = {
      wizard_form: [
        { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Order Details', visible: true, validated: false },
        { id: 'step-2', holder_id: 'step-2-wrapper', name: 'Attach Documents', visible: false, validated: false },
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
      orderCreatedKeySSI: '',
    };

    this.on('add-file', (event) => {
      const files = event.data;

      if (files) {
        files.forEach((file) => {
          this.files.push({ fileContent: file, type: DocumentTypes.Document });
          this.model.form.documents.push({
            name: file.name,
            attached_by: Roles.Sponsor,
            date: new Date().toLocaleString(),
            link: '',
            canRemove: true,
            uuid: uuidv4(),
          });
        });
      }

      if (event.data) this.docs = event.data;
    });

    this.on('add-kit-ids-file', async (event) => {
      const files = event.data;

      if (files && files.length > 0) {
        try {
          this.files.push({ fileContent: files[0], type: DocumentTypes.Kit });
          const ids = await this.readFile(files[0]);
          this.model.form.inputs.kit_ids_attachment.name = files[0].name;
          this.model.form.inputs.kit_ids_attachment.ids = ids;
        } catch (err) {
          console.log(err);
          this.model.form.inputs.kit_ids_attachment.name = 'No File';
          this.model.form.inputs.kit_ids_attachment.error = err;
        }
      }
    });

    this.onTagClick('remove-file', (document) => {
      if (document.canRemove === true) {
        const fileIdx = this.files.findIndex((x) => x.fileContent.name === document.name);
        this.files.splice(fileIdx, 1);
        let doc = this.model.form.documents.find((item) => item.uuid === document.uuid);
        let idx = this.model.form.documents.indexOf(doc);
        this.model.form.documents.splice(idx, 1);
      }
    });

    this.onTagClick('download-file', async (model, target, event) => {
      const filename = target.getAttribute('data-custom') || null;
      if (filename) {
        window.WebCardinal.loader.hidden = false;
        const file = this.files.find((x) => x.fileContent.name === filename);
        await this.FileDownloaderService.prepareDownloadFromBrowser(file.fileContent);
        this.FileDownloaderService.downloadFileToDevice(filename);
        window.WebCardinal.loader.hidden = true;
      }
    });

    //When you click step 1
    this.onTagEvent('step-1', 'click', (e) => {
      makeStepActive('step-1', 'step-1-wrapper', e);
    });

    //When you click step 2
    this.onTagEvent('step-2', 'click', (e) => {
      makeStepActive('step-2', 'step-2-wrapper', e);
    });

    //When you click step 3
    this.onTagEvent('step-3', 'click', (e) => {
      makeStepActive('step-3', 'step-3-wrapper', e);
    });

    //When you click step 4
    this.onTagEvent('step-4', 'click', (e) => {
      makeStepActive('step-4', 'step-4-wrapper', e);
    });

    //STEP BUTTONS LOGIC

    //When you want to navigate from step 1 to step 2
    this.onTagEvent('from_step_1_to_2', 'click', (e) => {
      makeStepActive('step-2', 'step-2-wrapper', e);
    });

    //When you want to navigate from step 2 to step 1
    this.onTagEvent('from_step_2_to_1', 'click', (e) => {
      makeStepActive('step-1', 'step-1-wrapper', e);
    });

    //When you want to navigate from step 2 to step 3
    this.onTagEvent('from_step_2_to_3', 'click', (e) => {
      makeStepActive('step-3', 'step-3-wrapper', e);
    });

    //When you want to navigate from step 3 to step 2
    this.onTagEvent('from_step_3_to_2', 'click', (e) => {
      makeStepActive('step-2', 'step-2-wrapper', e);
    });

    //When you want to navigate from step 3 to step 2
    this.onTagEvent('from_step_3_to_4', 'click', (e) => {
      makeStepActive('step-4', 'step-4-wrapper', e);
    });

    //When you submit form
    this.onTagEvent('form_submit', 'click', (e) => {
      this.showErrorModal(
        new Error(`Are you sure you want to submit the order?`), // An error or a string, it's your choice
        'Submit Order',
        onSubmitYesResponse,
        onNoResponse,
        {
          disableExpanding: true,
          cancelButtonText: 'No',
          confirmButtonText: 'Yes',
          id: 'error-modal',
        }
      );
    });

    const onSubmitYesResponse = async () => {
      const payload = {};

      if (this.model.form) {
        if (this.model.form.inputs) {
          let keys = Object.keys(this.model.form.inputs);
          if (keys) {
            keys.forEach((key) => {
              if (key === 'delivery_date' || key === 'delivery_time') {
                payload['delivery_date'] = this.getDateTime();
              } else if (key.indexOf('keep_between_temperature') !== -1) {
                payload['keep_between_temperature'] = this.getTemperature();
              } else {
                payload[key] = this.model.form.inputs[key].value;
              }
            });
          }
        }

        if (this.model.form.documents) {
          payload['files'] = [];
          this.files.forEach((file) => {
            if (file.type === DocumentTypes.Document) {
              payload['files'].push(file.fileContent);
            }
          });
        }

        payload['kitIds'] = JSON.parse(JSON.stringify(this.model.form.inputs.kit_ids_attachment.ids));
        payload['kitIdsFile'] = this.files.find((x) => x.type === DocumentTypes.Kit).fileContent;

        console.log('SUBMIT : Payload: ', payload);

        const result = await this.ordersService.createOrder(payload);

        this.model.orderCreatedKeySSI = result.keySSI;

        console.log(result);

        eventBusService.emitEventListeners(Topics.RefreshNotifications, null);

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
    };

    const onNoResponse = () => console.log('Why not?');

    //When you reset form
    this.onTagEvent('form_reset', 'click', (e) => {
      this.model.form = viewModelResolver('order').form;
      this.files = [];
    });

    //Add active menu class to element
    function makeStepActive(step_id, step_holder_id, e) {
      if (e) {
        e.wizard_form.forEach((item) => {
          document.getElementById(item.id).classList.remove('step-active');
          hideStep(item.holder_id);
        });

        document.getElementById(step_id).classList.add('step-active');

        showStep(step_holder_id);
      }
    }

    function hideStep(item) {
      var el = document.getElementById(item);
      el.classList.add('step-hidden');
    }

    function showStep(item) {
      var el = document.getElementById(item);
      el.classList.remove('step-hidden');
    }
  }

  getDateTime() {
    return this.model.form.inputs.delivery_date.value + ' ' + this.model.form.inputs.delivery_time.value;
  }

  getTemperature() {
    return {
      min: this.model.form.inputs.keep_between_temperature_min.value,
      max: this.model.form.inputs.keep_between_temperature_max.value,
    };
  }

  // TODO: Copy below functions to utils
  readFile(file) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = () => {
        resolve(this.extractIdsFromCsv(reader.result));
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  extractIdsFromCsv(contents) {
    // for demo purposes assume comma separated values
    const ids = contents.split(',');
    console.log(!ids, ids.length === 0, !ids.every((i) => typeof i === 'string'));
    if (!ids || ids.length === 0 || !ids.every((i) => typeof i === 'string')) {
      // TODO: not working well, always strings
      throw new Error('File could not be read.');
    }
    console.log(ids);
    return ids;
  }
}
