const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService.js');
const {FoldersEnum, kit } = require('./constants');
const {kitsStatusesEnum} = kit;
const ShipmentsService = require('./ShipmentsService.js');

class KitsService extends DSUService {
  KITS_TABLE = 'kits';

  constructor(DSUStorage, communicationService) {
    super(DSUStorage, FoldersEnum.Kits);
    if (communicationService) {
      this.communicationService = communicationService;
    }
    this.storageService = getSharedStorage(DSUStorage);
		this.shipmentsService = new ShipmentsService(DSUStorage);
    this.DSUStorage = DSUStorage;
  }

  async addStudyKitDataTODb(studyId, studyKitData){
    let studyKitsDb;
    try{
      await this.storageService.getRecord(this.KITS_TABLE, studyId);
      studyKitsDb = await this.storageService.updateRecord(this.KITS_TABLE, studyId, studyKitData);
    }
    catch (e){
      studyKitsDb = await this.storageService.insertRecord(this.KITS_TABLE, studyId, studyKitData);
    }
    return studyKitsDb;
  }

  async getAllStudiesKits() {
    const result = await this.storageService.filter(this.KITS_TABLE);
    return result ? result : [];
  }

  async updateStudyKitsDSU(studyId,  kitsDSUData, kitIds, progressUpdateCallback){
    let studyKitsDSU;
    try{
        let studyKitDb = await this.storageService.getRecord(this.KITS_TABLE, studyId);
        studyKitsDSU = await this.getEntityAsync(studyKitDb.keySSI, FoldersEnum.StudyKits);
    }
    catch (e) {
      const initialData = {
        kits:[],
        studyId:studyId
      }
      studyKitsDSU = await this.saveEntityAsync(initialData, FoldersEnum.StudyKits);
    }

    for (let i = 0; i < kitIds.length; i++) {
      const data = {
        kitId: kitIds[i].kitId,
        status: kitsStatusesEnum.AvailableForAssignment
      };
      const kitDSU  = await this.saveEntityAsync(data, FoldersEnum.Kits);
      studyKitsDSU.kits.push({
        ...data,
        kitKeySSI:kitDSU.keySSI,
        orderId:kitsDSUData.orderId,
        shipmentId:kitsDSUData.shipmentId,
      })
      progressUpdateCallback(undefined, i/kitIds.length);
    }
    studyKitsDSU.lastModified = Date.now();
    studyKitsDSU = await this.updateEntityAsync(studyKitsDSU, FoldersEnum.StudyKits);
    return await this.addStudyKitDataTODb(studyId, studyKitsDSU);

  }

  async getOrderKits(studyId, orderId){
    let studyKitDb = await this.storageService.getRecord(this.KITS_TABLE, studyId);
    const kits = studyKitDb.kits.filter((kit => {
      return kit.orderId === orderId;
    }));
    return kits;
  }
}

module.exports = KitsService;
