const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const momentService = cscServices.momentService;
const { Topics, Commons } = cscServices.constants;
const statusesService = cscServices.StatusesService;


class KitHistoryModalControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);
		this.role = role;
		this.model = this.transformData();
		this.attachViewKitsHandler();
	}

	attachViewKitsHandler() {
		this.onTagClick('view-kits', () => {
			this.navigateToPageTag('kits', {
				uid: this.model.uid
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

		if (kit.status) {
			kit.status = [...kit.status.sort((function(a, b) {
				return new Date(a.date) - new Date(b.date);
			}))];
			const statuses = statusesService.getKitStatuses();

			kit.status.forEach(item => {
				item.approved = statuses.approvedKitStatuses.indexOf(item.status) !== -1;
				item.normal = statuses.normalKitStatuses.indexOf(item.status) !== -1;
				item.date = momentService(item.date).format(Commons.DateTimeFormatPattern);
			});
		} else {
			kit.kitId = '-';
			kit.status = [];
		}

		return kit;
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('KitHistoryModalController', KitHistoryModalControllerImpl);