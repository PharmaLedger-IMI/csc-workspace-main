const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const FileDownloaderService = cscServices.FileDownloaderService;
const ShipmentsService = cscServices.ShipmentService;
const { Roles, FoldersEnum, Topics } = cscServices.constants;
const KitsService = cscServices.KitsService;

export default class ScanShipmentController extends WebcController {
  constructor(...props) {
    super(...props);
    this.role = Roles.CMO;
    this.model = this.history.location.state.shipment;
    this.model.submitDisabled = false;
    this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);
    this.shipmentsService = new ShipmentsService(this.DSUStorage);
    this.kitsService = new KitsService(this.DSUStorage);
    this.init();
  }

  async init() {
    await this.initScanViewModel();
    this.attachEventListeners();
    this.handleOnChange = true;
  }

  attachEventListeners() {
    this.initStepperNavigationHandlers();
    this.downloadKitListHandler();
    this.attachFormActions();
    this.attachShipmentScannerHandlers();
    this.attachKitsScannerHandlers();
    this.navigationHandlers();
  }

  navigationHandlers() {
    this.onTagClick('nav-back', () => {
      this.history.goBack();
    });

    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Order });
    });

    this.onTagClick('shipments', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Shipment });
    });

    this.onTagClick('view-shipment', () => {
      this.navigateToPageTag('shipment', { uid: this.model.shipmentUID });
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
      if (this.handleOnChange) {
        console.log('[SCAN] ', this.model.scannedShipmentData);
        this.model.isShipmentScannerActive = false;
        this.model.isShipmentScanOk = this.model.scannedShipmentData === this.model.shipmentId;
        this.model.showWrongShipmentScanResult = !this.model.isShipmentScanOk;
        this.model.showCorrectShipmentScanResult = this.model.isShipmentScanOk;
      }
    });

    this.model.onChange('scannedKitIds',()=>{
      const scanProgressElement = this.querySelector("#scan-progress .progress-bar");
      scanProgressElement.style.width = (this.model.scannedKitIds.length / this.model.kits.length)*100+"%";
      this.model.numberOfScannedKits = this.model.scannedKitIds.length;
    })
  }

  step1NavigationHandler() {
    this.model.enableStep1Navigation = this.model.canScanShipment === false && this.model.isShipmentScannerActive === false;
  }

  resetScanStatus = () =>{
    this.model.showWrongKitScanResult = false;
    this.model.showCorrectKitScanResult = false;
    this.model.alreadyScanned = false;
  }

  attachKitsScannerHandlers() {
    this.onTagClick('open-kits-scanner', () => {
      this.model.canScanKit = false;
      this.model.isKitsScannerActive = true;
    });

    let scanKitsAgainHandler = () => {
      this.model.isKitsScannerActive = true;
      this.resetScanStatus();
    };

    this.onTagClick('back-to-kit-scan', scanKitsAgainHandler);
    this.onTagClick('scan-again-kits', scanKitsAgainHandler);

    this.model.onChange('canScanKit', this.step2NavigationHandler.bind(this));
    this.model.onChange('isKitsScannerActive', this.step2NavigationHandler.bind(this));

    this.model.onChange('scannedKitData', () => {
      if (this.handleOnChange) {
        console.log('[SCAN] ', this.model.scannedKitData);

        this.resetScanStatus();

        if (!this.model.kits.includes(this.model.scannedKitData)) {
          this.model.showWrongKitScanResult = true;
        } else if (this.model.scannedKitIds.includes(this.model.scannedKitData)) {
          this.model.alreadyScanned = true;
        } else {
          this.model.showCorrectKitScanResult = true;
          this.model.scannedKitIds.push(this.model.scannedKitData);
          this.model.lastKitId = this.model.scannedKitData;
        }
        this.model.isKitsScannerActive = false;
      }
      this.handleOnChange = true;
    });

    this.onTagClick('next-kit-scan', (model, target, e) => {
      if (this.model.scannedKitIds.length < this.model.kits.length) {
        this.model.canScanKit = true;
        this.resetScanStatus();
        this.model.kitScanButtonText = 'Scan Next Kit';
      } else {
        this.model.foundAllCorrectKitScans = true;
        this.makeStepActive('step-3', 'step-3-wrapper', e);
      }
    });
  }

  step2NavigationHandler() {
    this.model.enableStep2Navigation = this.model.canScanKit === false && this.model.isKitsScannerActive === false;
  }

  attachFormActions() {
    this.onTagClick('scan:reset', async (model, target, e) => {
      await this.initScanViewModel();
      this.makeStepActive('step-1', 'step-1-wrapper', e);
      this.handleOnChange = false;
    });

    this.onTagClick('scan:submit', async () => {
      if (this.model.isShipmentScanOk && this.model.foundAllCorrectKitScans) {
        this.model.submitDisabled = true;
        window.WebCardinal.loader.hidden = false;
        const newShipmentData = { isShipmentScanSuccessful: true };
        await this.shipmentsService.updateLocalShipment(this.model.shipmentUID, newShipmentData);
        let modalOptions = {
          disableExpanding: true,
          disableCancelButton: true,
          confirmButtonText: 'Ok',
          id: 'confirm-modal',
        };
        window.WebCardinal.loader.hidden = true;
        this.showModal(
          'Shipment scanned successfully!',
          'Scan Shipment',
          () => { this.navigateToPageTag('shipment', { uid: this.model.shipmentUID }); },
          () => { this.navigateToPageTag('shipment', { uid: this.model.shipmentUID }); },
          modalOptions
        );
      }
    });
  }

  initStepperNavigationHandlers() {
    this.onTagClick('step-1', (model, target, e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagClick('step-2', (model, target, e) => {
      if (!this.model.isShipmentScanOk) {
        return;
      }

      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagClick('step-3', (model, target, e) => {
      if (!this.model.foundAllCorrectKitScans) {
        return;
      }

      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagClick('from_step_1_to_1', (model, target, e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });
    this.onTagClick('from_step_1_to_2', (model, target, e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });
    this.onTagClick('from_step_2_to_1', (model, target, e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });


    this.onTagClick('from_step_2_to_3', (model, target, e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });
  }

  makeStepActive(step_id, step_holder_id, e) {
    if (e) {
      this.model.wizard_form.forEach((item) => {
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

  downloadKitListHandler() {
    this.onTagClick('download-kits-file', async (model) => {
      window.WebCardinal.loader.hidden = false;
      const fileName = model.kitsFilename;
      const path = FoldersEnum.KitIds + '/' + model.kitsSSI + '/' + 'files';
      await this.FileDownloaderService.prepareDownloadFromDsu(path, fileName);
      this.FileDownloaderService.downloadFileToDevice(fileName);
      window.WebCardinal.loader.hidden = true;
    });
  }

  async initScanViewModel() {
    await this.getKits();
    this.model.kitsData = { kitsSSI: this.model.kitsSSI };
    this.model.wizard_form = [
      { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Scan Shipment', visible: true, validated: false },
      { id: 'step-2', holder_id: 'step-2-wrapper', name: 'Scan Kits', visible: false, validated: false },
      { id: 'step-3', holder_id: 'step-3-wrapper', name: 'Confirmation', visible: false, validated: false },
    ];

    this.model.scannedShipmentData = '';
    this.model.isShipmentScanOk = false;
    this.model.canScanShipment = true;
    this.model.isShipmentScannerActive = false;
    this.model.showWrongShipmentScanResult = false;
    this.model.showCorrectShipmentScanResult = false;

    this.model.scannedKitData = '';
    this.model.kitScanButtonText = 'Scan';
    this.model.lastKitId = "No kit was scanned yet";
    this.model.scannedKitIds = [];
    this.model.numberOfScannedKits=0;
    this.model.foundAllCorrectKitScans = false;
    this.model.canScanKit = true;
    this.model.isKitsScannerActive = false;
    this.model.showWrongKitScanResult = false;
    this.model.showCorrectKitScanResult = false;
  }

  async getKits() {
    const kitDSU = await this.kitsService.getKitIdsDsu(this.model.kitsSSI);
    this.model.kits = kitDSU.kitIds.map(singleKit=>singleKit.kitId);
  }
}
