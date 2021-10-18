const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;

class KitSummaryControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    this.kitsService = new KitsService(this.DSUStorage);
    this.model.kitsLoaded = false;
    this.init();
  }

  async init() {
    await this.getKits();
  }

  async getKits() {
    const isEncrypted = this.model.kitsSSI ? false : true;
    const keySSI = isEncrypted ? this.model.kitIdKeySSIEncrypted : this.model.kitsSSI;
    const kits = await this.kitsService.getKitsDSU(keySSI, isEncrypted);
    this.model = { ...JSON.parse(JSON.stringify(this.model)), ...kits };
    this.model.kitsLoaded = true;
    this.model = JSON.parse(JSON.stringify(this.model));
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('KitSummaryController', KitSummaryControllerImpl);
