const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const FileDownloaderService = cscServices.FileDownloaderService;
const { Roles, Commons, FoldersEnum } = cscServices.constants;

class ScanShipmentModalController extends WebcController {

    constructor(...props) {
    super(...props);

	this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);

	this.initScanViewModel();
	this.attachEventListeners();
	this.attachFormActions();

}

attachEventListeners() {
	this.initStepperNavigationHandlers();
	this.downloadKitListHandler();


    this.model.onChange('scannedShipmentData', () => {
		this.model.isShipmentScannerActive = false;
		if(this.model.scannedShipmentData === this.model.shipmentId){
			this.model.showCorrectShipmentScanResult = true;
			this.model.foundCorrectShipmentScan = true;
			this.showStep('shipment-scan-result');
		} else {
			this.model.showWrongShipmentScanResult = true;
			this.model.wrongScanDataTag = "retry-shipment-scan";
			this.showStep('wrong-shipment-scan-wrapper');
		}

	});
	
	this.model.onChange('scannedKitData', () => {
			this.model.isKitsScannerActive = false;
			if(this.model.scannedKitData === this.model.currentKitId){
				
				this.model.scannedKitIds.push(this.model.scannedKitData);
				if(this.model.scanNum >= this.model.kits.length-1){
					this.model.showKitsScanResult = true;
					this.model.foundAllCorrectKitScans = true;
					this.model.scanNum++;
				} else {
					this.model.scanNum++;
					this.model.kitScanButtonText = "Scan Next Kit";
					this.model.currentKitId = this.model.kits[this.model.scanNum];
					this.showStep('step-2-wrapper');
					
				}
				
			} else {
				this.model.showWrongKitScanResult = true;
				this.showStep('wrong-kit-scan-wrapper');
			}
			
			
	});
}

attachFormActions() {
	this.onTagClick('scan:reset', (model, target, event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		this.model.foundAllCorrectKitScans = false;
		this.model.foundCorrectShipmentScan = false;
		this.model.showCorrectShipmentScanResult = false;
		this.model.showKitsScanResult = false;
		this.model.scannedKitIds = [];
		this.model.scanNum = 0;
		this.model.showWrongShipmentScanResult = false;
		this.model.showWrongKitScanResult = false;
		this.model.currentKitId = this.model.kits[0];

	});

	this.onTagClick('scan:submit', () => {
		if(this.model.foundCorrectShipmentScan && this.model.foundAllCorrectKitScans){
			this.send('confirmed', this.model);
		}
		
	});
}

initScanViewModel() {
	let model = {
		"wizard_form" :  [
			{ id: 'step-1', holder_id: 'step-1-wrapper', name: 'Scan Shipment', visible: true, validated: false },
			{ id: 'step-2', holder_id: 'step-2-wrapper', name: 'Scan Kits', visible: false, validated: false },
			{ id: 'step-3', holder_id: 'step-3-wrapper', name: 'Confirmation', visible: false, validated: false },
			{ id: 'step-1', holder_id: 'shipment-scanner', name: 'Shipment Scanner', visible: false, validated: false },
			{ id: 'step-1', holder_id: 'shipment-scan-result', name: 'Shipment Scan Res', visible: true, validated: false },
			{ id: 'step-1', holder_id: 'wrong-shipment-scan-wrapper', name: 'Shipment Scan Res', visible: true, validated: false },
			{ id: 'step-2', holder_id: 'kit-scanner', name: 'Kit Scanner', visible: false, validated: false },
			{ id: 'step-2', holder_id: 'kit-scan-result', name: 'All Kit Scan Result', visible: false, validated: false },
			{ id: 'step-2', holder_id: 'wrong-kit-scan-wrapper', name: 'Shipment Scan Res', visible: true, validated: false },
		],
		"scannedShipmentData" : "",
		"scannedKitData" : "",
		"isShipmentScannerActive" : false,
		"showCorrectShipmentScanResult" : false,
		"showWrongShipmentScanResult" : false,
		"foundCorrectShipmentScan" : false,
		"isKitsScannerActive" : false,
		"showKitsScanResult" : false,
		"scanNum" : 0,
		"currentKitId" : this.model.kits[0],
		"scannedKitIds" : [],
		"foundAllCorrectKitScans" : false,
		"kitScanButtonText" : "Scan",
		"wrongScanText" : "",
		"wrongScanDataTag" : "",
		"showWrongKitScanResult" : false
	};
	this.model = {...this.model, ...model};
}

 	initStepperNavigationHandlers() {
		this.onTagEvent('step-1', 'click', (e) => {
			if(this.model.foundCorrectShipmentScan){
				this.model.showCorrectShipmentScanResult = true;
				this.makeStepActive('step-1', 'shipment-scan-result',e);
				
			} else if (this.model.showWrongShipmentScanResult){
				this.makeStepActive('step-1', 'wrong-shipment-scan-wrapper', e);
			} else {
				this.makeStepActive('step-1', 'step-1-wrapper', e);
			}
			
		});

		this.onTagEvent('step-2', 'click', (e) => {
			if(this.model.foundAllCorrectKitScans){
				 this.model.showKitsScanResult = true;
				 this.makeStepActive('step-2', 'kit-scan-result',e);
			} else {
				this.makeStepActive('step-2', 'step-2-wrapper', e);
			}
			
			
		});

		this.onTagEvent('step-3', 'click', (e) => {
			this.model.showCorrectShipmentScanResult = false;
			this.makeStepActive('step-3', 'step-3-wrapper', e);
		});

		this.onTagEvent('open-shipment-scanner', 'click', (e) => {
			this.model.showWrongShipmentScanResult = false;
			this.hideStep('step-1-wrapper');
			this.model.isShipmentScannerActive = true;
			this.makeStepActive('step-1','shipment-scanner',e);
		});
		
		this.onTagEvent('retry-shipment-scan', 'click', (e) => {
			this.hideStep('wrong-shipment-scan-wrapper');
			this.model.isShipmentScannerActive = true;
		});
		this.onTagEvent('open-kits-scanner', 'click', (e) => {
			
			this.hideStep('step-2-wrapper');
			this.model.isKitsScannerActive = true;
			this.makeStepActive('step-2','kit-scanner',e);
			
		});

		this.onTagEvent('retry-kit-scan', 'click', (e) => {
			this.hideStep('wrong-kit-scan-wrapper');
			this.model.isKitsScannerActive = true;
		});

		this.onTagEvent('from_step_1_to_2', 'click', (e) => {
			this.model.showCorrectShipmentScanResult = false;
			this.makeStepActive('step-2', 'step-2-wrapper', e);
		});

		this.onTagEvent('from_step_2_to_3', 'click', (e) => {
			this.model.showKitsScanResult = !this.model.showKitsScanResult
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
		  const path =  FoldersEnum.Kits + '/' + model.kitsSSI + '/' + 'files';
		  await this.FileDownloaderService.prepareDownloadFromDsu(path, fileName);
		  this.FileDownloaderService.downloadFileToDevice(fileName);
		  window.WebCardinal.loader.hidden = true;
		});
	  }


}

export default ScanShipmentModalController;
