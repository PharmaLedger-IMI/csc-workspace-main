const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const { FoldersEnum } = cscServices.constants;
const FileDownloaderService = cscServices.FileDownloaderService;
const KitsService = cscServices.KitsService;

class KitSummaryControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    this.kitsService = new KitsService(this.DSUStorage);
    this.fileDownloaderService = new FileDownloaderService(this.DSUStorage);
    this.model.kitsLoaded = false;
    this.init();
  }

  async init() {
    await this.attachDownloadHandler();
    await this.getKits();
  }

  attachDownloadHandler() {
    this.onTagClick('download-kits-file', async (model) => {
      window.WebCardinal.loader.hidden = false;
      const fileName = model.file.name;
      const { keySSI, isEncrypted } = this.getKitsSSI();
      const path = FoldersEnum.Kits + '/' + keySSI + '/' + 'files';
      await this.fileDownloaderService.prepareDownloadFromDsu(path, fileName);
      this.fileDownloaderService.downloadFileToDevice(fileName);
      window.WebCardinal.loader.hidden = true;
    });
  }

  async getKits() {
    const { keySSI, isEncrypted } = this.getKitsSSI();
    const kits = await this.kitsService.getKitsDSU(keySSI, isEncrypted);
    this.model = { ...JSON.parse(JSON.stringify(this.model)), ...kits };
    this.model.kitsLoaded = true;
    this.model = JSON.parse(JSON.stringify(this.model));
  }

  getKitsSSI() {
    const isEncrypted = this.model.kitsSSI ? false : true;
    const keySSI = isEncrypted ? this.model.kitIdKeySSIEncrypted : this.model.kitsSSI;
    return { keySSI, isEncrypted };
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('KitSummaryController', KitSummaryControllerImpl);
