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
      const keySSI  = this.model.kitsSSI;
      const path = FoldersEnum.Kits + '/' + keySSI + '/' + 'files';
      await this.fileDownloaderService.prepareDownloadFromDsu(path, fileName);
      this.fileDownloaderService.downloadFileToDevice(fileName);
      window.WebCardinal.loader.hidden = true;
    });
  }

  async getKits() {
    const keySSI = this.model.kitsSSI;
    const kits = await this.kitsService.getKitsDSU(keySSI);
    this.model = { ...JSON.parse(JSON.stringify(this.model)), ...kits };
    this.model.kitsLoaded = true;
    this.model = JSON.parse(JSON.stringify(this.model));
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('KitSummaryController', KitSummaryControllerImpl);
