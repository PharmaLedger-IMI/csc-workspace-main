import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

export default class DashboardController extends ContainerController {

    constructor(...props) {

        super(...props);

        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "dashboard");
        
    }

}
