const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentService = cscServices.ShipmentService;
const KitsService = cscServices.KitsService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics, kit } = cscServices.constants;
const { kitsMessagesEnum } = kit;
class ScanShipmentController extends WebcController {

  constructor(...props) {
    super(...props);
    this.originalShipment = this.history.location.state.shipment;
    this.shipmentService = new ShipmentService();
    this.kitsService = new KitsService();
    this.model = { shipmentModel: viewModelResolver('shipment') };
    this.model.shipment = this.originalShipment;
    this.retrieveKitIds(this.originalShipment.kitIdSSI);
    this.model.disableSign = false;

    this.initScanViewModel();
    this.initStepperNavigationHandlers();
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
        this.model.formIsInvalid = !this.model.isShipmentScanOk;
    });
  }

  step1NavigationHandler() {
    this.model.enableStep1Navigation = this.model.canScanShipment === false && this.model.isShipmentScannerActive === false;
  }

  async retrieveKitIds(kitIdSSI) {
    this.model.shipmentModel.kitsAreAvailable = false;
    this.model.shipmentModel.kits = await this.getKits(kitIdSSI);
    this.model.shipmentModel.kitsAreAvailable = true;
    this.model.kitsData = { kitsSSI: kitIdSSI};
  }

  async getKits(kitIdSSI) {
    return await this.kitsService.getKitIdsDsu(kitIdSSI);
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
      this.navigateToPageTag('shipment', { uid: this.model.shipment.uid });
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
      let receivedComment = {
          date: new Date().getTime(),
          entity: '<' + Roles.Site + '> (' +  this.model.shipment.siteId + ')',
          comment: this.model.shipmentModel.form.add_comment.value
      }

      await this.shipmentService.createAndMountReceivedDSU(this.model.shipment.uid, payload, receivedComment);
      eventBusService.dispatchEvent(Topics.RefreshShipments + this.model.shipment.shipmentId, null);


      let {studyId, orderId}  = this.model.shipment;
      let shipmentId = this.model.shipment.shipmentId;
      let sponsorId = this.model.shipment.sponsorId;
      let kits = await this.kitsService.getKitIdsDsu(this.model.shipment.kitIdSSI);


    let redirectToShipmentView = () => {
      this.shipmentService.sendMessageToEntity(sponsorId,kitsMessagesEnum.ShipmentSigned,{
        studyKeySSI: studyKitData.sReadSSI
      },'Shipment Signed')

      this.showErrorModalAndRedirect('Shipment was received, Kits can be managed now.', 'Shipment Received', {
        tag: 'shipment',
        state: { uid: this.model.shipment.uid }
      }, 2000);

    };

    this.model.kitsMounting = {
      progress: 0,
      importInProgress:true,
      eta:"-"
    };

    window.WebCardinal.loader.hidden = true;
    this.showModalFromTemplate("kitMountingProgressModal",redirectToShipmentView.bind(this),redirectToShipmentView.bind(this),{
      controller: 'KitMountingProgressController',
      modalTitle:`Shipment ${shipmentId}: Kits Import`,
      disableExpanding: true,
      disableBackdropClosing: true,
      disableClosing: true,
      disableCancelButton: true,
      model:this.model
    })

    const studyKitData = await this.kitsService.updateStudyKitsDSU(studyId, {
      orderId,
      shipmentId
    }, kits.kitIds, (err, progress) => {
      this.model.kitsMounting.progress = parseInt(progress*100);
    });

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
    this.model.scannedShipmentData = '';
    this.model.isShipmentScanOk = false;
    this.model.canScanShipment = true;
    this.model.isShipmentScannerActive = false;
    this.model.showWrongShipmentScanResult = false;
    this.model.showCorrectShipmentScanResult = false;
  }
}

export default ScanShipmentController;
