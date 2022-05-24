const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrderService = cscServices.OrderService;
const ShipmentService = cscServices.ShipmentService;
const FileDownloaderService = cscServices.FileDownloaderService;
const viewModelResolver = cscServices.viewModelResolver;
const { FoldersEnum, Topics, Commons } = cscServices.constants;
const { shipmentStatusesEnum } = cscServices.constants.shipment;
const momentService = cscServices.momentService;

export default class EditShipmentController extends WebcController {

	constructor(...props) {
		super(...props);
		this.model.submitDisabled = false;
		this.model.uid = this.history.location.state.uid;
		this.initServices()
	}

	async initServices(){
		this.ordersService = new OrderService();
		this.shipmentsService = new ShipmentService();
		this.FileDownloaderService = new FileDownloaderService();

		this.attachEventHandlers();
		this.initViewModel();

		this.model.onChange('shipmentModel.form', this.checkFormValidity.bind(this));

	}

	validateForm() {
		if(this.model.shipmentModel.form){
			// Validation For Dimension Values
			let keys = Object.keys(this.model.shipmentModel.form.dimension);
				keys.forEach( (key) => {
					if(this.model.shipmentModel.form.dimension[key].value !== undefined){
						if(this.model.shipmentModel.form.dimension[key].value.indexOf('-') !== -1){
							this.model.shipmentModel.form.dimension[key].value = this.model.shipmentModel.form.dimension[key].value.replace('-','');
						}
					}
				});
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
      this.navigateToPageTag('shipment', { uid: this.model.uid });
    });
  }

	downloadKitListHandler() {
		this.onTagClick('download-kits-file', async (model) => {
			window.WebCardinal.loader.hidden = false;
			const fileName = model.order.kitsFilename;
			const path = FoldersEnum.KitIds + '/' + model.order.kitsSSI + '/' + 'files';
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
			await this.shipmentsService.updateShipment(this.model.uid, shipmentStatusesEnum.ReadyForDispatch, shipmentData);
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
					this.navigateToPageTag('shipment', { uid: this.model.uid });
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

	getTimestampFromDateTime(dateTime) {
		return momentService(dateTime.date + ' ' + dateTime.time).valueOf();
	}

	getWizardForm() {
		return [
			{ id: 'step-1', holder_id: 'step-1-wrapper', name: 'Shipment Details', visible: true, validated: false },
			{ id: 'step-2', holder_id: 'step-2-wrapper', name: 'Confirmation' }
		];
	}

	checkFormValidity(){
		//To be refactored according to current step
		const requiredInputs = [
			this.model.shipmentModel.form.courierId.value,
			this.model.shipmentModel.form.origin.value,
			this.model.shipmentModel.form.destinationAddress.country.value,
			this.model.shipmentModel.form.destinationAddress.city.value,
			this.model.shipmentModel.form.destinationAddress.poBox.value,
			this.model.shipmentModel.form.destinationAddress.street.value,
			this.model.shipmentModel.form.destinationAddress.building.value,
			this.model.shipmentModel.form.transportMode.value,
			this.model.shipmentModel.form.pickupDate.value,
			this.model.shipmentModel.form.pickupTime.value,
			this.model.shipmentModel.form.dimension.height.value,
			this.model.shipmentModel.form.dimension.length.value,
			this.model.shipmentModel.form.dimension.width.value,
			this.model.shipmentModel.form.weight.value,
			this.model.shipmentModel.form.shippingConditions.value
		];
	
		let validationConstraints = [
		  ...requiredInputs.map(input => this.isInputFilled(input))
		];
		this.model.formIsInvalid = typeof (validationConstraints.find(val => val !== true)) !== 'undefined';
	  }

	  isInputFilled(field){
		return typeof field !== 'undefined' && field.trim()!==""
	  }

	async initViewModel() {
			this.model.orderModel =  viewModelResolver('order');
			this.model.shipmentModel = viewModelResolver('shipment')

		//all order fields are disabled
		for (let prop in this.model.orderModel.form.inputs) {
			this.model.orderModel.form.inputs[prop].disabled = true;
		}

		this.model.shipmentModel.shipment = await this.shipmentsService.getShipment(this.model.uid);
		this.model.orderModel.order = await this.ordersService.getOrder(this.model.shipmentModel.shipment.orderSSI);
		this.model.orderModel.order = { ...this.transformOrderData(this.model.orderModel.order) };

		this.model.wizard = this.getWizardForm();
		this.model.formIsInvalid = true;
	}

	prepareShipmentData() {
		const shipmentFormData = this.model.toObject('shipmentModel.form');

		return {
			courierId: shipmentFormData.courierId.value,
			origin: shipmentFormData.origin.value,
			destinationAddress:{
				country:shipmentFormData.destinationAddress.country.value,
				city:shipmentFormData.destinationAddress.city.value,
				street:shipmentFormData.destinationAddress.street.value,
				poBox:shipmentFormData.destinationAddress.poBox.value,
				building:shipmentFormData.destinationAddress.building.value
			},
			transportMode: shipmentFormData.transportMode.value,
			scheduledPickupDateTime: this.getTimestampFromDateTime({
				date: shipmentFormData.pickupDate.value,
				time: shipmentFormData.pickupTime.value
			}),
			volumeUoM:shipmentFormData.volumeUoM.value,
			dimension: {
				dimensionWidth: shipmentFormData.dimension.width.value,
				dimensionHeight: shipmentFormData.dimension.height.value,
				dimensionLength: shipmentFormData.dimension.length.value
			},
			weightUoM:shipmentFormData.weightUoM.value,
			weight:shipmentFormData.weight.value,
			specialInstructions: shipmentFormData.specialInstructions.value,
			shippingConditions: shipmentFormData.shippingConditions.value
		};
	}
}
