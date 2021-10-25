const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentService = cscServices.ShipmentService;
const OrderService = cscServices.OrderService;
const KitsService = cscServices.KitsService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics } = cscServices.constants;


class ScanShipmentController extends WebcController {

  constructor(...props) {
    super(...props);
    this.originalShipment = this.history.location.state.shipment;
    let communicationService = CommunicationService.getInstance(Roles.Courier);
    this.shipmentService = new ShipmentService(this.DSUStorage, communicationService);
    this.orderService = new OrderService(this.DSUStorage, communicationService);
    this.kitsService = new KitsService(this.DSUStorage, communicationService);
    this.model = { shipmentModel: viewModelResolver('shipment') };
    this.model.shipment = this.originalShipment;
    this.retrieveKitIds(this.originalShipment.kitIdSSI);
    this.model.disableSign = false;

    this.onTagEvent("start-scanner", 'click', () => {
      this.model.isScannerActive = true;
    });

    this.initScanViewModel();
    this.initStepperNavigationHandlers();
    this.addModelChangeHandlers();
  }

  async retrieveKitIds(kitIdSSI) {
    this.model.shipmentModel.kitsAreAvailable = false;
    this.model.shipmentModel.kits = await this.getKits(kitIdSSI);
    this.model.shipmentModel.kitsAreAvailable = true;
    this.model.kitsData = { kitsSSI: kitIdSSI};
  }

  async getKits(kitIdSSI) {
    const kitDSU = await this.kitsService.getKitsDSU(kitIdSSI);
    return kitDSU;
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

    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard');
    });

    this.onTagClick('view-shipment', () => {
      this.navigateToPageTag('shipment', { keySSI: this.model.shipment.shipmentSSI });
    });

    this.onTagClick('nav-back', () => {
      this.history.goBack();
    });
    
    this.onTagEvent('sign_button', 'click', (e) => {
      this.sign();
    });

  }

  async sign() {
      let payload = {
            receivedDateTime: new Date().getTime()
      };
      this.model.disableSign = true;
      window.WebCardinal.loader.hidden = false;
      payload.shipmentId = this.model.shipment.shipmentId;
      payload.shipmentActualTemperature = this.model.shipmentModel.form.temperature.value;
      payload.signature = true;
      let receivedComment = {
          date: new Date().getTime(),
          entity: Roles.Site,
          comment: this.model.shipmentModel.form.add_comment.value
      }

      await this.shipmentService.createAndMountReceivedDSU(this.model.shipment.shipmentSSI, payload, receivedComment);
      eventBusService.emitEventListeners(Topics.RefreshShipments + this.model.shipment.shipmentId, null);


      //TODO: add UI loader here:issue #437
      let order = await this.orderService.getOrder(this.model.shipment.orderSSI);
      let {studyId, orderId}  = order;
      let shipmentId = this.model.shipment.shipmentId;
      let kits = await this.kitsService.getKitsDSU(this.model.shipment.kitIdSSI);
      const studyKitData = await this.kitsService.updateStudyKitsDSU(studyId,{orderId,shipmentId},kits.kitIds,(err, progress)=>{
        //consume progress
        console.log(progress);
      })

      // TODO:  send a message to SPONSOR with the studyKitData.keySSI(studyKitDSU)
      this.showErrorModalAndRedirect('Shipment was received, Kits can be managed now.', 'Shipment Received', { tag: 'shipment', state: { keySSI: this.model.shipment.shipmentSSI } }, 2000);
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