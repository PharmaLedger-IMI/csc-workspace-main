// MyModalController.js
const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { shipment, Roles, Topics } = cscServices.constants;

class ScanShipmentController extends WebcController {

  constructor(...props) {
    super(...props);

    this.originalShipment = this.history.location.state.shipment;
    let communicationService = CommunicationService.getInstance(Roles.Courier);
    this.shipmentService = new ShipmentService(this.DSUStorage, communicationService);
    this.model = {	shipmentModel: viewModelResolver('shipment') };
    this.model.shipment = this.originalShipment;
    this.model.disableSign = false;

    this.onTagEvent("start-scanner", 'click', () => {
      this.model.isScannerActive = true;
    });

    this.initScanViewModel();
    this.initStepperNavigationHandlers();
    this.addModelChangeHandlers();
    this.navigationHandlers();
  }

    navigationHandlers() {
      this.onTagClick('dashboard', () => {
        this.navigateToPageTag('dashboard');
      });

      this.onTagClick('view-shipment', () => {
        this.navigateToPageTag('shipment', { keySSI: this.model.shipment.shipmentSSI });
      });
    }

  addModelChangeHandlers() {
    this.model.onChange("scannedData", () => {
      let correctValue = this.model.shipment.orderId;
      this.model.scanSuccess = this.model.scannedData === correctValue;
      this.model.formIsInvalid = !this.model.scanSuccess;
      this.model.isScannerActive = false;
    });

    this.shipmentIdHandler = () => {
      this.model.formIsInvalid = this.model.shipmentModel.form.shipmentId.value.trim() === '';
    };
    this.model.onChange("shipmentModel.form.shipmentId.value", this.shipmentIdHandler.bind(this));
  }

  initStepperNavigationHandlers() {
    this.onTagEvent('step-1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('step-2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
      this.shipmentIdHandler();
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

    this.onTagEvent('sign_button', 'click', (e) => {
      this.sign();
    });

  }

  getDateTime() {
    return this.model.shipmentModel.form.shipment_date.value + ' ' + this.model.shipmentModel.form.shipment_time.value;
  }

  async sign() {
    let payload = {};
    let {keySSI}  = this.model.shipment;
    let shipmentDataProps = ["shipperId", "scheduledPickupDateTime", "dimension", "origin", "specialInstructions", "shippingConditions"];
    this.model.disableSign = true;
    window.WebCardinal.loader.hidden = false;
    shipmentDataProps.forEach((prop) => {
      payload[prop] = this.model.shipment[prop];
    });
    payload.shipmentId = this.model.shipmentModel.form.shipmentId.value;
    payload.signature = true;

    await this.shipmentService.createAndMountTransitDSU(this.model.shipment.shipmentSSI, payload);
    eventBusService.emitEventListeners(Topics.RefreshShipments + this.model.shipment.shipmentId, null);

    this.showErrorModalAndRedirect('Shipment Pickedup, redirecting to dashboard...', 'Shipment Pickup', {
        tag: 'shipment',
         state: { keySSI: keySSI }
        }, 2000);
    window.WebCardinal.loader.hidden = true;
  }
  
  getModel() {
    return {
      isScannerActive: false,
      formIsInvalid: true,
      scannedData: ''
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
      this.model.isScannerActive = true;
      this.model.scannedData = '';
      this.model.scanSuccess = false;
  }
}

export default ScanShipmentController;
