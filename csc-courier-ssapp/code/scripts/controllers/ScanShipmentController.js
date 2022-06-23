const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentService = cscServices.ShipmentService;
const eventBusService = cscServices.EventBusService;
const {  Topics } = cscServices.constants;

class ScanShipmentController extends WebcController {

  constructor(...props) {
    super(...props);

    this.originalShipment = this.history.location.state.shipment;

    this.initServices().then(() => {
      this.initScanViewModel();
      this.initStepperNavigationHandlers();
      this.addModelChangeHandlers();
      this.navigationHandlers();
      this.attachShipmentScannerHandlers();
    });
  }

  async initServices(){
    this.shipmentService = new ShipmentService();
    this.model = {	shipmentModel: viewModelResolver('shipment') };
    await this.getAllShipmentIds();
    this.model.shipment = this.originalShipment;
    this.uniqueShipmentIdError = false;
      this.model.disableSign = false;
  }

    navigationHandlers() {
      this.onTagClick('dashboard', () => {
        this.navigateToPageTag('dashboard');
      });

      this.onTagClick('view-shipment', () => {
        this.navigateToPageTag('shipment', { uid: this.model.shipment.uid });
      });
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

  addModelChangeHandlers() {
    this.model.onChange("shipmentModel.form.shipmentId.value", this.validateForm.bind(this));
    this.model.onChange("shipmentModel.form.temperatureLoggerId.value", this.validateForm.bind(this));
  }

  validateForm(){
    this.model.formIsInvalid = false;

    this.model.uniqueShipmentIdError = this.shipmentIds.includes(this.model.shipmentModel.form.shipmentId.value.trim());
    if (this.model.shipmentModel.form.shipmentId.value.trim() === '' || this.model.uniqueShipmentIdError) this.model.formIsInvalid = true;
    if (this.model.shipmentModel.form.temperatureLoggerId.value.trim() === '') this.model.formIsInvalid = true;

    this.model.disableSign = this.model.formIsInvalid;
  }

  initStepperNavigationHandlers() {
    this.onTagEvent('step-1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('step-2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
      this.validateForm();
    });

    this.onTagEvent('step-3', 'click', (e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagEvent('from_step_1_to_1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
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

    this.onTagEvent('sign_button', 'click', (e) => {
      this.sign();
    });
  }

  async sign() {
    let payload = {};
    let {uid}  = this.model.shipment;
    let shipmentDataProps = ["courierId", "scheduledPickupDateTime", "dimension", "origin", "specialInstructions", "shippingConditions"];
    this.model.disableSign = true;
    window.WebCardinal.loader.hidden = false;
    shipmentDataProps.forEach((prop) => {
      payload[prop] = this.model.shipment[prop];
    });
    payload.shipmentId = this.model.shipmentModel.form.shipmentId.value;
    payload.temperatureLoggerId = this.model.shipmentModel.form.temperatureLoggerId.value;
    payload.signature = true;

    await this.shipmentService.createAndMountTransitDSU(this.model.shipment.uid, payload);
    eventBusService.dispatchEvent(Topics.RefreshShipments + this.model.shipment.shipmentId, null);

    this.showErrorModalAndRedirect('Shipment Pickedup, redirecting to dashboard...', 'Shipment Pickup', {
        tag: 'shipment',
         state: { uid: uid }
        }, 2000);
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
          { id: 'step-3', holder_id: 'step-3-wrapper', name: 'Sign', visible: false, validated: false },
        ];
      this.model.wizard_form_navigation = [
          { id: 'from_step_1_to_2', name: 'Next', visible: true, validated: false },
          { id: 'from_step_2_to_1', name: 'Previous', visible: true, validated: false },
          { id: 'from_step_2_to_3', name: 'Next', visible: true, validated: false },
          { id: 'from_step_3_to_2', name: 'Previous', visible: true, validated: false },
        ];
    this.model.scannedShipmentData = '';
    this.model.isShipmentScanOk = false;
    this.model.canScanShipment = true;
    this.model.isShipmentScannerActive = false;
    this.model.showWrongShipmentScanResult = false;
    this.model.showCorrectShipmentScanResult = false;
  }

  async getAllShipmentIds(){
    this.shipmentIds = (await this.shipmentService.getShipments()).map(shipment => shipment.shipmentId);
  }
}

export default ScanShipmentController;
