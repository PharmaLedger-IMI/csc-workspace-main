const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const { Topics } = cscServices.constants;

class DashboardMenuControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);

		this.model = { unread: 0 };
		this.notificationsService = new NotificationsService(this.DSUStorage);

		this.updateActiveMenu();
		this.getNotificationsUnread();
		this.attachAll();
	}

	updateActiveMenu() {
		if (this.history.location.pathname === '/new-order') {
			return this.makeMenuActive('menu-new-order');
		}

		if (this.history.location.pathname === '/notifications') {
			return this.makeMenuActive('menu-notifications');
		}

		this.makeMenuActive('menu-dashboard');
	}

	makeMenuActive(id) {
		this.querySelectorAll('webc-link.dashboard-tab').forEach((link) => {
			link.classList.remove('dashboard-tab-active');
		});

		const activeTab = this.querySelector(`#${id}`);
		if (activeTab) {
			activeTab.classList.add('dashboard-tab-active');
		}
	}

	async getNotificationsUnread() {
		const unread = await this.notificationsService.getNumberOfUnreadNotifications();
		this.model.unread = unread || 0;
	}

	attachAll() {
		this.model.addExpression('isUnreadZero', () => {
			return !!this.model.unread;
		}, 'unread');

		eventBusService.addEventListener(Topics.RefreshNotifications, async () => {
			await this.getNotificationsUnread();
		});
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('DashboardMenuController', DashboardMenuControllerImpl);