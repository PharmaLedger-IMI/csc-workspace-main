const { WebcController } = WebCardinal.controllers;
import NotificationsService from '../services/NotificationService.js';
import eventBusService from '../services/EventBusService.js';
import { Topics } from '../constants/topics.js';

export default class DashboardMenuController extends WebcController {

    constructor(...props) {

        super(...props);

        console.log(this.history);

        this.notificationsService = new NotificationsService(this.DSUStorage);

        this.model = {
            menu_items : [
                { name: "Dashboard" ,     url : "/" , id: "menu-dashboard"},
                { name: "Notifications" , url : "/notifications", id: "menu-notifications"},
            ],
            unread: 0
        }
        if(this.history.location.pathname === '/'){
            makeMenuActive('menu-dashboard');
            makeMenuInActive('menu-notifications');
        }


        if(this.history.location.pathname === '/notifications'){
            makeMenuActive('menu-notifications');
            makeMenuInActive('menu-dashboard');
        }

        //Add active menu class to element
        function makeMenuActive( element ){
            console.log("Making ACTIVE:" , element);
            document.getElementById(element).classList.add("dashboard-tab-active");
        }

        //Remove active menu class to element
        function makeMenuInActive( element ){
            console.log("Making INACTIVE:" , element);
            document.getElementById(element).classList.remove("dashboard-tab-active");
        }

        this.getNotificationsUnread();
        this.attachAll();
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
