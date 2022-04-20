const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const momentService = cscServices.momentService;
const statusesService = cscServices.StatusesService;
const { Commons, Topics  } = cscServices.constants;


class HistoryModalControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);
		this.role = role;

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
				uid: this.model.order.uid
			});
		});
	}

	attachViewShipmentHandler() {
		this.onTagClick('view-shipment', () => {
			this.navigateToPageTag('shipment', {
				uid: this.model.shipment.uid
			});
		});
	}

	attachViewKitsHandler() {
		this.onTagClick('view-kits', () => {

			this.navigateToPageTag('study-kits', {
				studyId: this.model.kits.studyId,
				orderId: this.model.kits.orderId
			});

		});
	}

	transformData() {
		return {
			order: this.transformOrderData(),
			shipment: this.transformShipmentData(),
			kits: this.transformKitData(),
			displayViewOrderButton: this.model.order && this.model.currentPage !== Topics.Order,
			displayViewShipmentButton: this.model.shipment && this.model.currentPage !== Topics.Shipment,
			displayViewKitsButton: this.model.kits && this.model.kits.length > 0
		};
	}

	transformOrderData() {
		const order = this.model.toObject('order') || {};
		if (order.status) {
			order.status = [...order.status.sort((function(a, b) {
				return new Date(a.date) - new Date(b.date);
			}))];

			const lastIndex = order.status.length - 1;
			const statuses = statusesService.getOrderStatuses();
			order.status.forEach((item, index) => {
				item.approved = statuses.approvedStatuses.includes(item.status) && index === lastIndex;
				item.cancelled = statuses.canceledStatuses.includes(item.status);
				item.normal = statuses.normalStatuses.includes(item.status);
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

		if (shipment.status) {
			shipment.shipmentExists = true;
			shipment.status = [...shipment.status.sort((function(a, b) {
				return new Date(a.date) - new Date(b.date);
			}))];

			const statuses = statusesService.getShipmentStatusesByRole(this.role);

			shipment.status.forEach(item => {
				item.approved = statuses.approvedStatuses.indexOf(item.status) !== -1;
				item.normal = statuses.normalStatuses.indexOf(item.status) !== -1;
				item.cancelled = statuses.canceledStatuses.indexOf(item.status) !== -1
				item.date = momentService(item.date).format(Commons.DateTimeFormatPattern);
			});
		} else {
			shipment.shipmentExists = false;
			shipment.shipmentId = 'Not assigned';
			shipment.status = [];
		}

		return shipment;
	}

	transformKitData() {
		const kits = this.model.toObject('kits')
		let statusesCounter = [];
		const kitsHistory = { status: [] , orderId : "" , studyId: ""};
		if (kits) {
			kits.forEach((kit) => {
				if (kit.status) {
					kitsHistory.orderId = kit.orderId;
					kitsHistory.studyId = kit.studyId;

					kit.status.forEach((item) => {

						if (!statusesCounter[item.status]) {
							statusesCounter[item.status] = {};
						}

						statusesCounter[item.status].status = item.status;

						if (!statusesCounter[item.status].count) {
							statusesCounter[item.status].count = 1;
						} else {
							statusesCounter[item.status].count += 1;
						}

						if (!statusesCounter[item.status].date) {
							statusesCounter[item.status].date = [];
							statusesCounter[item.status].date.push(item.date);
						} else {
							statusesCounter[item.status].date.push(item.date);
						}
					});
				}
			});

			const statuses = statusesService.getKitStatuses();

			Object.keys(statusesCounter).forEach(key => {
				if (Object.keys(statusesCounter[key]).length !== 0) {
					statusesCounter[key].approved = statuses.approvedKitStatuses.indexOf(statusesCounter[key].status) !== -1;
					statusesCounter[key].normal = statuses.normalKitStatuses.indexOf(statusesCounter[key].status) !== -1;
					statusesCounter[key].cancelled = statuses.canceledKitsStatuses.indexOf(statusesCounter[key].status) !== -1;
					statusesCounter[key].date = momentService(Math.max(...statusesCounter[key].date)).format(Commons.DateTimeFormatPattern);
					kitsHistory.status.push(statusesCounter[key]);
				}
			});
		}

		return kitsHistory;

	}



}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('HistoryModalController', HistoryModalControllerImpl);
