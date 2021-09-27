const { WebcController } = WebCardinal.controllers;

class TabNavigatorControllerImpl extends WebcController {

    constructor(role, ...props) {
        super(...props);

        this.model.isShipment = false;
        this.model.isOrder = false;
        this.model.isKit = false;

        if (this.model.shipments !== undefined) {
            this.model.isShipment = true;
        } else if (this.model.orders !== undefined) {
            this.model.isOrder = true;
        } else if (this.model.kits !== undefined) {
            this.model.isKit = true;
        }
    }
}

const controllersRegistry = require("../ControllersRegistry").getControllersRegistry();
controllersRegistry.registerController("TabNavigatorController", TabNavigatorControllerImpl);
