const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const momentService = cscServices.momentService;
const statusesService = cscServices.StatusesService;
const { Commons, Topics, Roles } = cscServices.constants;
const { orderStatusesEnum } = cscServices.constants.order;
const { shipmentStatusesEnum  } = cscServices.constants.shipment;

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
			displayViewKitsButton: this.model.kits && this.model.currentPage !== Topics.Kits
		};
	}

	transformOrderData() {
		const order = this.model.toObject('order') || {};

		if (order && order.status) {
			order.status = [...order.status.sort((function(a, b) {
				return new Date(a.date) - new Date(b.date);
			}))];

			const lastIndex = order.status.length - 1;
			order.status.forEach((item, index) => {
				item.approved = item.status === orderStatusesEnum.Approved && index === lastIndex;
				item.cancelledAfterApproval = item.status === orderStatusesEnum.Approved && (index === lastIndex - 1);
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

			const statuses = statusesService.getShipmentStatusesByRole(this.role);

			shipment.status.forEach(item => {
				item.approved = statuses.approvedStatuses.indexOf(item.status) !== -1;
				item.normal = statuses.normalStatuses.indexOf(item.status) !== -1;
				item.date = momentService(item.date).format(Commons.DateTimeFormatPattern);
				if (item.status === shipmentStatusesEnum.ShipmentCancelled) {
					item.status = shipmentStatusesEnum.Cancelled;
					item.cancelled = true;
				}
			});
		} else {
			shipment.shipmentId = '-';
			shipment.status = [];
		}

		return shipment;
	}

	transformKitData() {
		const kits = this.model.toObject('kits')
		let final = [];
		const object = { status: [] , orderId : "" , studyId: ""};

		if (kits) {
			kits.forEach((kit) => {
				if (kit.status) {
					object.orderId = kit.orderId;
					object.studyId = kit.studyId;

					kit.status.forEach((item) => {

						if (!final[item.status]) {
							final[item.status] = {};
						}

						final[item.status].status = item.status;

						if (!final[item.status].count) {
							final[item.status].count = 1;
						} else {
							final[item.status].count += 1;
						}

						if (!final[item.status].date) {
							final[item.status].date = [];
							final[item.status].date.push(item.date);
						} else {
							final[item.status].date.push(item.date);
						}
					});
				}
			});

			const statuses = statusesService.getKitStatuses();

			Object.keys(final).forEach(key => {
				if (Object.keys(final[key]).length !== 0) {
					final[key].approved = statuses.approvedKitStatuses.indexOf(final[key].status) !== -1;
					final[key].normal = statuses.normalKitStatuses.indexOf(final[key].status) !== -1;
					final[key].date = momentService(Math.max(...final[key].date)).format(Commons.DateTimeFormatPattern);
					object.status.push(final[key]);
				}
			});
		}

		return object;

	}



}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('HistoryModalController', HistoryModalControllerImpl);
