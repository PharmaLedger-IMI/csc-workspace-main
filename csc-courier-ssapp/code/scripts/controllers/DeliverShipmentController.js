const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentService = cscServices.ShipmentService;
const eventBusService = cscServices.EventBusService;
const { shipment,  Topics } = cscServices.constants;
const shipmentStatusesEnum = shipment.shipmentStatusesEnum;

class DeliverShipmentController extends WebcController {

  constructor(...props) {
    super(...props);
    this.originalShipment = this.history.location.state.shipment;

    this.shipmentService = new ShipmentService();
    this.model = this.getDeliverShipmentViewModel(shipment);
    this.model.shipment = this.originalShipment;
    this.model.disableSign = false;

    this.initStepperNavigationHandlers();
    this.addModelChangeHandlers();
    this.navigationHandlers();
    this.attachShipmentScannerHandlers();
  }

  attachShipmentScannerHandlers() {
    this.onTagClick('open-shipment-scanner', () => {
      this.model.canScanShipment = false;
      this.model.isShipmentScannerActive = true;
    });

    let scanAgainShipmentHandler =   () => {
      this.model.isShipmentScannerActive = true;
      this.model.showWrongShipmentScanResult = false;
      this.model.showCorrectShipmentScanResult = false;
    };

    this.onTagClick('back-to-shipment-scan', scanAgainShipmentHandler);
    this.onTagClick('scan-again-shipment', scanAgainShipmentHandler);

    this.model.onChange('canScanShipment', this.step1NavigationHandler.bind(this));
    this.model.onChange('isShipmentScannerActive', this.step1NavigationHandler.bind(this));

    this.model.onChange('scannedShipmentData', () => {
        console.log('[SCAN] ', this.model.scannedShipmentData);
        this.model.isShipmentScannerActive = false;
        this.model.isShipmentScanOk = this.model.scannedShipmentData === this.model.shipment.shipmentId;
        this.model.showWrongShipmentScanResult = !this.model.isShipmentScanOk;
        this.model.showCorrectShipmentScanResult = this.model.isShipmentScanOk;
    });
  }

  step1NavigationHandler() {
    this.model.enableStep1Navigation = this.model.canScanShipment === false && this.model.isShipmentScannerActive === false;
  }

  navigationHandlers() {
    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard');
    });

    this.onTagClick('view-shipment', () => {
      this.navigateToPageTag('shipment', { uid: this.model.shipment.uid });
    });
  }

  addModelChangeHandlers() {
    this.recipientHandler = () => {
      this.model.formIsInvalid = this.model.form.recipientName.value.trim() === '';
    };
    this.model.onChange("form.recipientName.value", this.recipientHandler.bind(this));
  }

  initStepperNavigationHandlers() {
    this.onTagEvent('step-1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('step-2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
      this.recipientHandler();
    });

    this.onTagEvent('step-3', 'click', (e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagEvent('from_step_1_to_2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
      this.recipientHandler();
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

    this.onTagEvent('sign_button', 'click', (e) => {
      this.sign();
    });

  }

  async sign() {
    let payload = {
      recipientName: this.model.form.recipientName.value,
      temperatureLogger: this.model.form.temperatureLogger.value,
      signature: true,
      deliveryDateTime: new Date().getTime()
    };
    this.model.disableSign = true;
    window.WebCardinal.loader.hidden = false;

    await this.shipmentService.updateTransitShipmentDSU(this.model.shipment.uid, payload, shipmentStatusesEnum.Delivered);
    eventBusService.dispatchEvent(Topics.RefreshShipments, null);
    this.showErrorModalAndRedirect(`Shipment ${this.model.shipment.shipmentId}  was delivered`, "Shipment Delivered", {tag:'dashboard'}, 2000);
    window.WebCardinal.loader.hidden = true;
  }

  getModel() {
    return {
      formIsInvalid: true
    }
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

  getDeliverShipmentViewModel() {
    let model = {
      wizard_form: [
        { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Scan Shipment', visible: true, validated: false },
        { id: 'step-2', holder_id: 'step-2-wrapper', name: 'Add Details', visible: false, validated: false, },
        { id: 'step-3', holder_id: 'step-3-wrapper', name: 'Sign', visible: false, validated: false },
      ],
      wizard_form_navigation: [
        { id: 'from_step_1_to_2', name: 'Next', visible: true, validated: false },
        { id: 'from_step_2_to_1', name: 'Previous', visible: true, validated: false },
        { id: 'from_step_2_to_3', name: 'Next', visible: true, validated: false },
        { id: 'from_step_3_to_2', name: 'Previous', visible: true, validated: false },
      ],
      form: viewModelResolver('shipment').form,
      scannedShipmentData: '',
      isShipmentScanOk: false,
      canScanShipment: true,
      isShipmentScannerActive: false,
      showWrongShipmentScanResult: false,
      showCorrectShipmentScanResult: false,
    };

    return model;
  }
}

export default DeliverShipmentController;
