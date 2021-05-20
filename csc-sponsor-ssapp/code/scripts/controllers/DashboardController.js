const { WebcController } = WebCardinal.controllers;

export default class DashboardController extends WebcController {

    constructor(element, history) {

        super(element, history);

        this.model = {
            name: "hi",
            search: "",
            dashboard_menu : [
                { name: "Initiate Order" , icon: "" , url : "/initiate-order" , tag: "initiate_order" },
                { name: "Dashboard" , icon: "" , url : "/dashboard", tag: "dashboard" },
                { name: "Pending Actions" , icon: "" , url : "/pending-actions", tag: "pending_actions" }
            ]
        };
    }


}
