const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { shipment, Roles, Topics } = cscServices.constants;
const shipmentStatusesEnum = shipment.shipmentStatusesEnum;

class DeliverShipmentController extends WebcController {

  constructor(...props) {
    super(...props);
    this.originalShipment = this.history.location.state.shipment;

    let communicationService = CommunicationService.getInstance(Roles.Courier);
    this.shipmentService = new ShipmentService(this.DSUStorage, communicationService);
    this.model = this.getDeliverShipmentViewModel(shipment);

    this.model.shipment = this.originalShipment;
    this.model.disableSign = false;

    this.onTagEvent("start-scanner", 'click', () => {
      this.model.isScannerActive = true;
    });

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
      let correctValue = this.model.shipment.shipmentId;
      this.model.scanSuccess = this.model.scannedData === correctValue;
      this.model.formIsInvalid = !this.model.scanSuccess;
      this.model.isScannerActive = false;
    });

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
      signature: true,
      deliveryDateTime: new Date().getTime()
    };
    this.model.disableSign = true;
    window.WebCardinal.loader.hidden = false;
    
    await this.shipmentService.updateTransitShipmentDSU(this.model.shipment.shipmentSSI, payload, shipmentStatusesEnum.Delivered);
    this.model.disableSign = false;
    window.WebCardinal.loader.hidden = true;
    eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    this.showErrorModalAndRedirect("Shipment" + this.model.shipment.shipmentId + " was delivered", "Shipment Delivered", '/', 2000);
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
      isScannerActive: true,
      scannedData: '',
      scanSuccess: false,
    };

    return model;
  }
}

export default DeliverShipmentController;
