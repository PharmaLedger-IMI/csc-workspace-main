const { WebcController } = WebCardinal.controllers;
import NotificationsService from '../services/NotificationService.js';

export default class DashboardMenuController extends WebcController {

    constructor(...props) {

        super(...props);

        console.log(this.history);

        this.notificationsService = new NotificationsService(this.DSUStorage);

        this.model = {
            menu_items : [
                { name: "Dashboard" ,     url : "/" , id: "menu-dashboard"},
                { name: "New Order" ,     url : "/new-order", id: "menu-new-order"},
                { name: "Notifications" , url : "/notifications", id: "menu-notifications"},
            ],
            unread: 0
        }
        if(this.history.location.pathname === '/'){
            makeMenuActive('menu-dashboard');
            makeMenuInActive('menu-new-order');
            makeMenuInActive('menu-notifications');
        }

        if(this.history.location.pathname === '/new-order'){
            makeMenuActive('menu-new-order');
            makeMenuInActive('menu-dashboard');
            makeMenuInActive('menu-notifications');
        }

        if(this.history.location.pathname === '/notifications'){
            makeMenuActive('menu-notifications');
            makeMenuInActive('menu-dashboard');
            makeMenuInActive('menu-new-order');
        }

        // //For every menu item check which one is the active and add the class
        // if(this.model.menu_items){
        //     this.model.menu_items.forEach( (item) => {
        //         // if(this.history.location.pathname === item.url){
        //         //     console.log("URL" , this.history.location.pathname);
        //         //     makeMenuActive(item.id);
        //         // }
        //         // else{
        //         //     makeMenuInActive(item.id);
        //         // }
        //
        //
        //     })
        // }

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

          this.on('update-notifications-count', (e) => {
            this.getNotificationsUnread();
          });
    }


}
