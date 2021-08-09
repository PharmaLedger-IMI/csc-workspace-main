const { WebcController } = WebCardinal.controllers;
const cscServices = require("csc-services");
const NotificationsService = cscServices.NotificationsService;
const eventBusService  = cscServices.EventBusService;
const { Topics }  = cscServices.constants;

export default class DashboardMenuController extends WebcController {

    constructor(...props) {

        super(...props);

        console.log(this.history);

        this.notificationsService = new NotificationsService(this.DSUStorage);

        this.model = {
            unread: 0
        }

        this.updateActiveMenu();
        this.getNotificationsUnread();
        this.attachAll();
    }

    updateActiveMenu() {
        if (this.history.location.pathname === '/') {
            this.makeMenuActive('menu-dashboard');
            this.makeMenuInActive('menu-notifications');
        }

        if (this.history.location.pathname === '/notifications') {
            this.makeMenuActive('menu-notifications');
            this.makeMenuInActive('menu-dashboard');
        }
    }

    //Add active menu class to element
    makeMenuActive(element) {
        this.querySelector(`#${element}`).classList.add("dashboard-tab-active");
    }

    //Remove active menu class to element
    makeMenuInActive(element) {
        this.querySelector(`#${element}`).classList.remove("dashboard-tab-active");
    }

    async getNotificationsUnread() {
        const unread = await this.notificationsService.getNumberOfUnreadNotifications();
        this.model.unread = unread || 0;
    }

    attachAll() {
        this.model.addExpression(
            'isUnreadZero',
            () => {
              return !!this.model.unread;
            },
            'unread'
        );

        eventBusService.addEventListener(Topics.RefreshNotifications, async (data) => {
            this.getNotificationsUnread();
        });
    }


}
