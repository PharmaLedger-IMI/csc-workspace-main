const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const { Topics, Commons, Roles } = cscServices.constants;
const { kitsTableHeaders, kitsStatusesEnum } = cscServices.constants.kit;
const kitStatusesService = cscServices.KitStatusesService;


class kitHistoryModalControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);
		this.role = role;
		this.model = this.transformData();
		this.attachViewKitsHandler();
	}

	attachViewKitsHandler() {
		this.onTagClick('view-kits', () => {
			this.navigateToPageTag('kits', {
				keySSI: this.model.keySSI
			});
		});
	}

	transformData() {
		return {
			kit: this.transformKitData(),
            displayViewKitsButton: this.model && this.model.currentPage !== Topics.Kits
		};
	}

	transformKitData() {
		let { kit } = this.model.toObject() || {};

		if (kit && kit.status) {
			kit.status = [...kit.status.sort((function(a, b) {
				return new Date(a.date) - new Date(b.date);
			}))];
			const statuses = kitStatusesService.getNormalAndApproveKitStatusByRole(this.role);

			kit.status.forEach(item => {
				item.approved = statuses.approvedKitStatuses.indexOf(item.status) !== -1;
				item.normal = statuses.normalKitStatuses.indexOf(item.status) !== -1;
				item.date = momentService(item.date).format(Commons.DateTimeFormatPattern);
//				if (item.status === kitsStatusesEnum.kitCancelled) {
//					item.status = kitsStatusesEnum.Cancelled;
//					item.cancelled = true;
//				}
			});
		} else {
			kit.kitId = '-';
			kit.status = [];
		}

		return kit;
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('kitHistoryModalController', kitHistoryModalControllerImpl);