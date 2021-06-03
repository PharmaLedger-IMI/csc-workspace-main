const { WebcController } = WebCardinal.controllers;
import OrdersService from '../services/OrdersService.js';

export default class DashboardController extends WebcController {
    name = {
        label: 'Name',
        name: 'name',
        required: true,
        placeholder: 'Please insert a name...',
        value: '',
      };

    constructor(...props) {

        super(...props);

        this.ordersService = new OrdersService(this.DSUStorage);

        this.model = {
            name: "hi",
            search: "",
            dashboard_menu : [
                { name: "Initiate Order" , icon: "" , url : "/initiate-order" , tag: "initiate_order" },
                { name: "Dashboard" , icon: "" , url : "/dashboard", tag: "dashboard" },
                { name: "Pending Actions" , icon: "" , url : "/pending-actions", tag: "pending_actions" }
            ],
            consent: {
                name: this.name,
              },
        };
    }


}
