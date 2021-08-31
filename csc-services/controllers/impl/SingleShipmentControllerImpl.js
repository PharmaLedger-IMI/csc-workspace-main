const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const { Roles, Commons } = cscServices.constants;
const { shipmentStatusesEnum, shipmentPendingActionEnum } = cscServices.constants.shipment;

const csIdentities = {};
csIdentities [Roles.Sponsor] = CommunicationService.identities.CSC.SPONSOR_IDENTITY;
csIdentities [Roles.CMO] = CommunicationService.identities.CSC.CMO_IDENTITY;
csIdentities [Roles.Site] = CommunicationService.identities.CSC.SITE_IDENTITY;
csIdentities [Roles.Courier] = CommunicationService.identities.CSC.COU_IDENTITY;

class SingleShipmentControllerImpl extends WebcController {
	constructor(role, ...props) {
		super(...props);

		this.role = role;

		let communicationService = CommunicationService.getInstance(csIdentities[role]);
		this.notificationsService = new NotificationsService(this.DSUStorage);
		this.ordersService = new OrdersService(this.DSUStorage, communicationService);
		this.shipmentsService = new ShipmentsService(this.DSUStorage, communicationService);

		this.initViewModel();
		this.attachEventListeners();
		this.openFirstAccordion();
	}

	attachEventListeners() {
		this.showHistoryHandler();
		this.downloadKitListHandler();
		this.toggleAccordionItemHandler();

		this.editShipmentHandler();
	}

	toggleAccordionItemHandler() {
		this.onTagEvent('toggle-accordion', 'click', (model, target) => {
			const targetIcon = target.querySelector('.accordion-icon');
			target.classList.toggle('accordion-item-active');
			targetIcon.classList.toggle('rotate-icon');

			const panel = target.nextElementSibling;
			if (panel.style.maxHeight === '1000px') {
				panel.style.maxHeight = '0px';
			} else {
				panel.style.maxHeight = '1000px';
			}
		});
	}

	openFirstAccordion() {
		const accordion = this.querySelector('.accordion-item');
		const targetIcon = accordion.querySelector('.accordion-icon');
		const panel = accordion.nextElementSibling;

		accordion.classList.toggle('accordion-item-active');
		targetIcon.classList.toggle('rotate-icon');
		panel.style.maxHeight = '1000px';
	}

	editShipmentHandler() {
		this.onTagClick('edit-shipment', () => {
			const modalConfiguration = {
				controller: 'EditShipmentController',
				disableExpanding: true,
				disableBackdropClosing: false,
				disableFooter: true,
				model: { keySSI: this.model.keySSI }
			};

			this.showModalFromTemplate('editShipment', this.confirmEditShipmentCallback, () => {
			}, modalConfiguration);
		});
	}

	confirmEditShipmentCallback = async (event) => {
		console.log('[EDIT Shipment] Confirm', event);
		const shipmentDetails = event.detail;
		const result = await this.shipmentsService.updateShipment(this.model.keySSI,
			shipmentDetails, shipmentStatusesEnum.ReadyForDispatch, this.role);

		console.log('\n\n[UPDATE SHIPMENT AFTER EDIT]\n\n', JSON.stringify(result, null, 2));
	};

	downloadKitListHandler() {
		this.onTagEvent('download-kit-list', 'click', (model, target, event) => {
			console.log('[EVENT] download-kit-list');
		});
	}

	showHistoryHandler() {
		this.onTagEvent('history-button', 'click', (model, target, event) => {
			console.log('[EVENT] history-button');
			// this.onShowHistoryClick();
		});
	}

	// TODO: Show Shipment History
	onShowHistoryClick() {
		this.createWebcModal({
			template: 'historyModal',
			controller: 'HistoryModalController',
			model: { order: this.model.order },
			disableBackdropClosing: false,
			disableFooter: true,
			disableHeader: true,
			disableExpanding: true,
			disableClosing: false,
			disableCancelButton: true,
			expanded: false,
			centered: true
		});

		console.log('Show History Clicked');
	}

	transformOrderData(data) {
		if (data) {
			data.delivery_date = this.getDateTime(data.deliveryDate);

			return data;
		}

		return {};
	}

	getDateTime(str) {
		const dateTime = str.split(' ');
		return {
			date: dateTime[0],
			time: dateTime[1]
		};
	}

	transformShipmentData(data) {
		if (data) {
			data.status_value = data.status.sort((function(a, b) {
				return new Date(b.date) - new Date(a.date);
			}))[0].status;

			data.status_date = momentService(data.status.sort((function(a, b) {
				return new Date(b.date) - new Date(a.date);
			}))[0].date).format(Commons.DateTimeFormatPattern);

			const approvedStatuses = [shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered, shipmentStatusesEnum.Received];
			data.status_approved = approvedStatuses.indexOf(data.status_value) !== -1;
			data.status_normal = !(data.status_approved);
			data.pending_action = this.getPendingAction(data.status_value);

			return data;
		}

		return {};
	}

	getPendingAction(status_value) {
		switch (status_value) {
			case shipmentStatusesEnum.InPreparation:
				return shipmentPendingActionEnum.PendingReadyForDispatch;

			case shipmentStatusesEnum.ReadyForDispatch:
				return shipmentPendingActionEnum.PendingPickUp;

			case shipmentStatusesEnum.InTransit:
				return shipmentPendingActionEnum.PendingDelivery;

			case shipmentStatusesEnum.Delivered:
				return shipmentPendingActionEnum.PendingReception;

			case shipmentStatusesEnum.Received:
				return shipmentPendingActionEnum.ManageKits;
		}

		return '-';
	}

	setShipmentActions() {
		const actions = {};

		// TODO: Update the logic according to statuses after #61 is completed
		actions.canScanShipment = false;
		actions.canEditShipment = true;

		return actions;
	}

	async initViewModel() {
		const model = viewModelResolver('order');
		//all fields are disabled
		for (let prop in model.form.inputs) {
			model.form.inputs[prop].disabled = true;
		}

		let { keySSI } = this.history.location.state;
		model.keySSI = keySSI;

		model.shipment = await this.shipmentsService.getShipment(model.keySSI);
		model.shipment = { ...this.transformShipmentData(model.shipment) };
		model.actions = this.setShipmentActions();

		model.order = await this.ordersService.getOrder(model.shipment.orderSSI);
		model.order = { ...this.transformOrderData(model.order) };

		this.model = model;
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('SingleShipmentController', SingleShipmentControllerImpl);