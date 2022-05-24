const {WebcController} = WebCardinal.controllers;
const cscServices = require('csc-services');
const FileDownloaderService = cscServices.FileDownloaderService;
const {FoldersEnum} = cscServices.constants;

class ScanShipmentModalControllerImpl extends WebcController {

    constructor(role, ...props) {
        super(...props);
        this.role = role;

        this.FileDownloaderService = new FileDownloaderService();

        this.initScanViewModel();
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.initStepperNavigationHandlers();
        this.downloadKitListHandler();
        this.attachFormActions();
        this.attachShipmentScannerHandlers();
        this.attachKitsScannerHandlers();
    }

    attachShipmentScannerHandlers() {
        this.onTagClick('open-shipment-scanner', () => {
            this.model.canScanShipment = false;
            this.model.isShipmentScannerActive = true;
        });

        this.onTagClick('back-to-shipment-scan', () => {
            this.model.isShipmentScannerActive = true;
            this.model.showWrongShipmentScanResult = false;
            this.model.showCorrectShipmentScanResult = false;
        });

        this.model.onChange('canScanShipment', this.step1NavigationHandler.bind(this));
        this.model.onChange('isShipmentScannerActive', this.step1NavigationHandler.bind(this));

        this.model.onChange('scannedShipmentData', () => {
            console.log('[SCAN] ', this.model.scannedShipmentData);
            this.model.isShipmentScannerActive = false;
            this.model.isShipmentScanOk = this.model.scannedShipmentData === this.model.shipmentId;
            this.model.showWrongShipmentScanResult = !this.model.isShipmentScanOk;
            this.model.showCorrectShipmentScanResult = this.model.isShipmentScanOk;
        });
    }

    step1NavigationHandler() {
        this.model.enableStep1Navigation = this.model.canScanShipment === false && this.model.isShipmentScannerActive === false;
    }

    attachKitsScannerHandlers() {
        this.onTagClick('open-kits-scanner', () => {
            this.model.canScanKit = false;
            this.model.isKitsScannerActive = true;
        });

        this.onTagClick('back-to-kit-scan', () => {
            this.model.isKitsScannerActive = true;
            this.model.showWrongKitScanResult = false;
            this.model.showCorrectKitScanResult = false;
        });

        this.model.onChange('canScanKit', this.step2NavigationHandler.bind(this));
        this.model.onChange('isKitsScannerActive', this.step2NavigationHandler.bind(this));

        this.model.onChange('scannedKitData', () => {
            console.log('[SCAN] ', this.model.scannedKitData);
            const isKitOk = this.model.scannedKitData === this.model.currentKit.kitId;
            this.model.isKitsScannerActive = false;
            this.model.showWrongKitScanResult = !isKitOk;
            this.model.showCorrectKitScanResult = isKitOk;
        });

        this.onTagClick('next-kit-scan', (model, target, e) => {
            if (this.model.currentKit.kitNumber < this.model.kits.length) {
                this.model.canScanKit = true;
                this.model.showWrongKitScanResult = false;
                this.model.showCorrectKitScanResult = false;
                this.model.kitScanButtonText = "Scan Next Kit";
                this.model.currentKit = this.model.kits[this.model.currentKit.kitNumber];
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
        this.onTagClick('scan:reset', (model, target, e) => {
            this.initScanViewModel();
            this.makeStepActive('step-1', 'step-1-wrapper', e);
        });

        this.onTagClick('scan:submit', () => {
            if (this.model.isShipmentScanOk && this.model.foundAllCorrectKitScans) {
                this.send('confirmed');
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

        this.onTagClick('from_step_1_to_2', (model, target, e) => {
            this.makeStepActive('step-2', 'step-2-wrapper', e);
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

    initScanViewModel() {
        this.model.wizard_form = [
            {id: 'step-1', holder_id: 'step-1-wrapper', name: 'Scan Shipment', visible: true, validated: false},
            {id: 'step-2', holder_id: 'step-2-wrapper', name: 'Scan Kits', visible: false, validated: false},
            {id: 'step-3', holder_id: 'step-3-wrapper', name: 'Confirmation', visible: false, validated: false}
        ];

        this.model.scannedShipmentData = "";
        this.model.isShipmentScanOk = false;
        this.model.canScanShipment = true;
        this.model.isShipmentScannerActive = false;
        this.model.showWrongShipmentScanResult = false;
        this.model.showCorrectShipmentScanResult = false;

        this.model.scannedKitData = "";
        this.model.kitScanButtonText = "Scan";
        this.model.currentKit = this.model.kits[0];
        this.model.scannedKitIds = [];
        this.model.foundAllCorrectKitScans = false;
        this.model.canScanKit = true;
        this.model.isKitsScannerActive = false;
        this.model.showWrongKitScanResult = false;
        this.model.showCorrectKitScanResult = false;
    }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ScanShipmentModalController', ScanShipmentModalControllerImpl);
