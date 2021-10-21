const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrderService = cscServices.OrderService;
const ShipmentService = cscServices.ShipmentService;
const FileDownloaderService = cscServices.FileDownloaderService;
const viewModelResolver = cscServices.viewModelResolver;
const { FoldersEnum, Topics, Commons } = cscServices.constants;
const { shipmentStatusesEnum } = cscServices.constants.shipment;
const CommunicationService = cscServices.CommunicationService;
const momentService = cscServices.momentService;

export default class EditShipmentController extends WebcController {

	constructor(...props) {
		super(...props);
		this.model.submitDisabled = false;
		this.model.keySSI = this.history.location.state.keySSI;
		this.ordersService = new OrderService(this.DSUStorage);
		let communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.CMO_IDENTITY);
		this.shipmentsService = new ShipmentService(this.DSUStorage, communicationService);
		this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);

		this.attachEventHandlers();
		this.initViewModel();


		// If form is validated
		this.model.isFormValidated = true;

	}

	validateForm() {
		let validated = true;

		if(this.model.shipmentModel.form){

			// Validation For Dimension Values
			let keys = Object.keys(this.model.shipmentModel.form.dimension);
			if(keys){
				keys.forEach( (key) => {
					if(this.model.shipmentModel.form.dimension[key].value !== undefined){
						if(this.model.shipmentModel.form.dimension[key].value.search('-') !== -1){
							this.model.shipmentModel.form.dimension[key].value = this.model.shipmentModel.form.dimension[key].value.replace('-','');
						}
					}
				});
			}

			this.model.isFormValidated = validated;
		}
	}

	attachEventHandlers() {
		this.downloadKitListHandler();
		this.attachNavigationHandlers();
		this.attachFormActions();
		this.navigationHandlers();
		this.attachModelChanges();
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
      this.navigateToPageTag('shipment', { keySSI: this.model.keySSI });
    });
  }

	downloadKitListHandler() {
		this.onTagClick('download-kits-file', async (model) => {
			window.WebCardinal.loader.hidden = false;
			const fileName = model.order.kitsFilename;
			const path = FoldersEnum.Kits + '/' + model.order.kitsSSI + '/' + 'files';
			await this.FileDownloaderService.prepareDownloadFromDsu(path, fileName);
			this.FileDownloaderService.downloadFileToDevice(fileName);
			window.WebCardinal.loader.hidden = true;
		});
	}

	resetEditOfShipment() {
		this.model.shipmentModel.form = viewModelResolver('shipment').form;
		this.makeStepActive('step-1', 'step-1-wrapper');
	}

	attachModelChanges() {
		this.model.onChange('shipmentModel.form.dimension', () => {
			this.validateForm();
		});
	}

	attachFormActions() {
		this.onTagClick('form:reset', (model, target, event) => {
			event.preventDefault();
			event.stopImmediatePropagation();

			this.showModalFromTemplate('resetEditShipmentModal', this.resetEditOfShipment.bind(this), () => {}, {
				disableExpanding: true,
				disableBackdropClosing: true,
			});

		});

		this.onTagClick('form:submit', async () => {
			window.WebCardinal.loader.hidden = false;
			this.model.submitDisabled = true;
			const shipmentData = this.prepareShipmentData();
			await this.shipmentsService.updateShipment(this.model.keySSI, shipmentStatusesEnum.ReadyForDispatch, shipmentData);
			this.showErrorModalAndRedirect('Shipment was edited, redirecting to dashboard...', 'Shipment Edited', { tag: 'dashboard', state: { tab: Topics.Shipment }}, 2000);
			let modalOptions = {
				disableExpanding: true,
				disableCancelButton: true,
				confirmButtonText: 'Ok',
				id: 'confirm-modal',
			};
			window.WebCardinal.loader.hidden = true;
			this.showModal(
				'Shipment edited successfully!',
				'Edit Shipment',
				() => {
					this.navigateToPageTag('shipment', { keySSI: this.model.keySSI });
				},
				() => {},
				modalOptions
			);
		});
	}

	makeStepActive(stepId, stepHolderId) {
		this.model.wizard.forEach((item) => {
			this.querySelector('#' + item.id).classList.remove('step-active');
			this.hideStep(item.holder_id);
		});

		this.querySelector('#' + stepId).classList.add('step-active');
		this.showStep(stepHolderId);
	}

	attachNavigationHandlers() {
		this.onTagEvent('step-1', 'click', () => {
			this.makeStepActive('step-1', 'step-1-wrapper');
		});

		this.onTagEvent('step-2', 'click', () => {
			this.makeStepActive('step-2', 'step-2-wrapper');
		});

		this.onTagEvent('from_step_1_to_2', 'click', () => {
			this.makeStepActive('step-2', 'step-2-wrapper');
		});
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

	transformOrderData(data) {
		if (data) {
			data.delivery_date = this.getDateTime(data.deliveryDate);

			return data;
		}

		return {};
	}

	getDateTime(timestamp) {
		return {
			date: momentService(timestamp).format(Commons.DateFormatPattern),
			time: momentService(timestamp).format(Commons.HourFormatPattern)
		};
	}

	getWizardForm() {
		return [
			{ id: 'step-1', holder_id: 'step-1-wrapper', name: 'Shipment Details', visible: true, validated: false },
			{ id: 'step-2', holder_id: 'step-2-wrapper', name: 'Confirmation' }
		];
	}

	async initViewModel() {
		this.model = {
			orderModel: viewModelResolver('order'),
			shipmentModel: viewModelResolver('shipment')
		};

		//all order fields are disabled
		for (let prop in this.model.orderModel.form.inputs) {
			this.model.orderModel.form.inputs[prop].disabled = true;
		}

		this.model.shipmentModel.shipment = await this.shipmentsService.getShipment(this.model.keySSI);
		this.model.orderModel.order = await this.ordersService.getOrder(this.model.shipmentModel.shipment.orderSSI);
		this.model.orderModel.order = { ...this.transformOrderData(this.model.orderModel.order) };

		this.model.wizard = this.getWizardForm();
	}

	prepareShipmentData() {
		const shipmentFormData = this.model.toObject('shipmentModel.form');

		return {
			shipperId: shipmentFormData.shipperId.value,
			origin: shipmentFormData.origin.value,
			shipmentType: shipmentFormData.type.value,
			scheduledPickupDateTime: {
				date: shipmentFormData.pickupDate.value,
				time: shipmentFormData.pickupTime.value
			},
			dimension: {
				dimensionWidth: shipmentFormData.dimension.width.value,
				dimensionHeight: shipmentFormData.dimension.height.value,
				dimensionLength: shipmentFormData.dimension.length.value
			},
			specialInstructions: shipmentFormData.specialInstructions.value,
			shippingConditions: shipmentFormData.shippingConditions.value
		};
	}
}
