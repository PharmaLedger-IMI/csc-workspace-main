const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const momentService = cscServices.momentService;
const { Commons, Topics } = cscServices.constants;
const { orderStatusesEnum } = cscServices.constants.order;
const { shipmentStatusesEnum } = cscServices.constants.shipment;

class HistoryModalControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);

		// this.controllerElement = props[0];
		this.model = this.transformData();
		this.attachEventHandlers();
	}

	attachEventHandlers() {
		this.attachViewOrderHandler();
		this.attachViewShipmentHandler();
		this.attachViewKitsHandler();
	}

	attachViewOrderHandler() {
		this.onTagClick('view-order', () => {
			this.navigateToPageTag('order', {
				keySSI: this.model.order.keySSI
			});
		});
	}

	attachViewShipmentHandler() {
		this.onTagClick('view-shipment', () => {
			this.navigateToPageTag('shipment', {
				keySSI: this.model.shipment.keySSI
			});
		});
	}

	attachViewKitsHandler() {
		this.onTagClick('view-kits', () => {
			this.navigateToPageTag('kits', {
				keySSI: this.model.kits.keySSI
			});
		});
	}

	// onReady() {
	// 	this.controllerElement.shadowRoot.querySelector('.webc-modal-dialog').style.maxWidth = '1000px';
	// }

	transformData() {
		return {
			order: this.transformOrderData(),
			shipment: this.transformShipmentData(),
			displayViewOrderButton: this.model.order && this.model.currentPage !== Topics.Order,
			displayViewShipmentButton: this.model.shipment && this.model.currentPage !== Topics.Shipment,
			displayViewKitsButton: this.model.kits && this.model.currentPage !== Topics.Kits
		};
	}

	transformOrderData() {
		const order = this.model.toObject('order') || {};

		if (order && order.status) {
			order.status = [...order.status.sort((function(a, b) {
				return new Date(a.date) - new Date(b.date);
			}))];

			order.status.forEach((item) => {
				item.approved = item.status === orderStatusesEnum.Approved;
				item.cancelled = item.status === orderStatusesEnum.Canceled;
				item.normal = item.status !== orderStatusesEnum.Canceled && item.status !== orderStatusesEnum.Approved;
				item.date = momentService(item.date).format(Commons.DateTimeFormatPattern);
			});
		} else {
			order.orderId = '-';
			order.status = [];
		}

		return order;
	}

	transformShipmentData() {
		const shipment = this.model.toObject('shipment') || {};

		if (shipment && shipment.status) {
			shipment.status = [...shipment.status.sort((function(a, b) {
				return new Date(a.date) - new Date(b.date);
			}))];

			const approvedStatuses = [shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered, shipmentStatusesEnum.Received];
			shipment.status.forEach(item => {
				item.approved = approvedStatuses.indexOf(item.status) !== -1;
				item.normal = !item.approved;
				item.date = momentService(item.date).format(Commons.DateTimeFormatPattern);
			});
		} else {
			shipment.shipmentId = '-';
			shipment.status = [];
		}

		return shipment;
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('HistoryModalController', HistoryModalControllerImpl);
