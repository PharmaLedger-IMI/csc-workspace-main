const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentService = cscServices.ShipmentService;
const OrderService = cscServices.OrderService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { shipment, Roles, Topics } = cscServices.constants;


class ScanShipmentController extends WebcController {

  constructor(...props) {
    super(...props);
    this.originalShipment = this.history.location.state.shipment;
    let communicationService = CommunicationService.getInstance(Roles.Courier);
    this.shipmentService = new ShipmentService(this.DSUStorage, communicationService);
    this.orderService = new OrderService(this.DSUStorage, communicationService);
    this.model = {	shipmentModel: viewModelResolver('shipment') };
    this.model.shipment = this.originalShipment;
    this.retrieveKitIds(this.originalShipment.kitIdSSI);

    this.onTagEvent("start-scanner", 'click',() => {
      this.model.isScannerActive = true;
    });

    this.initScanViewModel();
    this.initStepperNavigationHandlers();
    this.addModelChangeHandlers();
  }

  async retrieveKitIds(kitIdSSI){
    this.model.shipmentModel.kitsAreAvailable = false;
    this.model.shipmentModel.kits = await this.orderService.getKitIds(kitIdSSI);
    this.model.shipmentModel.kitsAreAvailable = true;
  }

  addModelChangeHandlers() {
    this.model.onChange("scannedData", () => {
      let correctValue = this.model.shipment.shipmentId;
      this.model.scanSuccess = this.model.scannedData === correctValue;
      this.model.formIsInvalid = !this.model.scanSuccess;
      this.model.isScannerActive = false;
    });
  }

  initStepperNavigationHandlers() {
    this.onTagEvent('step-1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('step-2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
      // this.shipmentIdHandler();
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

  sign(){
    this.shipmentService.sendMessageToSpo(this.model.shipment.shipmentSSI);
    eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    this.showErrorModalAndRedirect('Shipment was edited, redirecting to dashboard...', 'Shipment Edited', { tag: 'dashboard', state: { tab: Topics.Shipment }}, 2000);
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
        { id: 'step-3', holder_id: 'step-3-wrapper', name: 'Confirmation', visible: false, validated: false },
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