const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService.js');
const ShipmentsService = require('./ShipmentsService.js');
const CommunicationService = require('./lib/CommunicationService.js');
const { FoldersEnum, kit } = require('./constants');
const { kitsStatusesEnum } = kit;

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

  async getKitsDSU(kitsKeySSI) {
    const kitsDataDsu = await this.getEntityAsync(kitsKeySSI, FoldersEnum.Kits);
    return kitsDataDsu;
  }

  // TODO: Fotis: Rafael why separate arg studyId? Isn't studyId inside studyKitData?
  async addStudyKitDataToDb(studyId, studyKitData) {
    let studyKitsDb;
    try {
      await this.storageService.getRecord(this.KITS_TABLE, studyId);
      studyKitsDb = await this.storageService.updateRecord(this.KITS_TABLE, studyId, studyKitData);
    } catch (e) {
      studyKitsDb = await this.storageService.insertRecord(this.KITS_TABLE, studyId, studyKitData);
    }
    return studyKitsDb;
  }

  async getAllStudiesKits() {
    const result = await this.storageService.filter(this.KITS_TABLE);
    return result ? result : [];
  }

  async getStudyKits(studyId){
    return await this.storageService.getRecord(this.KITS_TABLE, studyId);
  }

  async markStudyKitsAsSynchronized(studyId){
    let studyKitDb = await this.storageService.getRecord(this.KITS_TABLE, studyId);
    studyKitDb.synchronized = true;
    return await this.storageService.updateRecord(this.KITS_TABLE, studyId, studyKitDb);
  }

  async updateStudyKitsDSU(studyId, kitsDSUData, kitIds, progressUpdateCallback) {
    let studyKitsDSU;
    try {
      let studyKitDb = await this.storageService.getRecord(this.KITS_TABLE, studyId);
      studyKitsDSU = await this.getEntityAsync(studyKitDb.keySSI, FoldersEnum.StudyKits);
    } catch (e) {
      const initialData = {
        kits: [],
        studyId: studyId,
      };
      studyKitsDSU = await this.saveEntityAsync(initialData, FoldersEnum.StudyKits);
    }

    for (let i = 0; i < kitIds.length; i++) {
      const data = {
        kitId: kitIds[i].kitId,
        status: [{status:kitsStatusesEnum.Received, date:Date.now()}],
        orderId: kitsDSUData.orderId,
        shipmentId: kitsDSUData.shipmentId,
        studyId: studyId,
      };
      const kitDSU = await this.saveEntityAsync(data, FoldersEnum.Kits);
      studyKitsDSU.kits.push({
        ...data,
        kitKeySSI: kitDSU.keySSI,
        orderId: kitsDSUData.orderId,
        shipmentId: kitsDSUData.shipmentId,
      });
      progressUpdateCallback(undefined, (i + 1) / kitIds.length);
    }
    studyKitsDSU.lastModified = Date.now();
    studyKitsDSU = await this.updateEntityAsync(studyKitsDSU, FoldersEnum.StudyKits);
    return await this.addStudyKitDataToDb(studyId, studyKitsDSU);
  }

  async getOrderKits(studyId, orderId) {
    let studyKitDb = await this.storageService.getRecord(this.KITS_TABLE, studyId);
    const kits = studyKitDb.kits.filter((kit) => {
      return kit.orderId === orderId;
    });
    return kits;
  }

  async getKitDetails(kitSSI) {
    const kitDetails = await this.getKitsDSU(kitSSI);
    const shipments = await this.shipmentsService.getShipments();
    const shipment = shipments.find((shipment) => {
      return shipment.shipmentId === kitDetails.shipmentId;
    });

    const orderDsu = await this.getEntityAsync(shipment.orderSSI, FoldersEnum.Orders);
    const shipmentComments = await this.getEntityAsync(shipment.shipmentComments, FoldersEnum.ShipmentComments);
    const shipmentReceivedDsu = await this.getEntityAsync(shipment.receivedDSUKeySSI, FoldersEnum.ShipmentReceived);

    kitDetails.studyId = orderDsu.studyId;
    kitDetails.recipientName = shipment.recipientName;
    kitDetails.temperatures = orderDsu.temperatures;
    kitDetails.temperatureComments = orderDsu.temperature_comments;
    kitDetails.shipmentComments = shipmentComments.comments;
    kitDetails.shipmentActualTemperature = shipmentReceivedDsu.shipmentActualTemperature;
    kitDetails.receivedDateTime = shipmentReceivedDsu.receivedDateTime;
    return kitDetails;
  }

  async updateKit(kitSSI, status, kitData){
    //update KitDSU
    let kitDSU = await this.getKitsDSU(kitSSI);
    let newStatus ={
      status:status,
      date:Date.now()
    }
    kitDSU.status.push(newStatus);

    kitDSU = {...kitDSU, ...kitData};
    kitDSU =  await this.updateEntityAsync(kitDSU,FoldersEnum.Kits);

    //update StudyKit DSU
    let studyKitDb = await this.storageService.getRecord(this.KITS_TABLE, kitDSU.studyId);
    let studyKitsDSU = await this.getEntityAsync(studyKitDb.keySSI, FoldersEnum.StudyKits);

    studyKitsDSU.lastModified = Date.now();
    let modifiedKit = studyKitsDSU.kits.find((kit)=>{return kit.kitKeySSI === kitSSI});
    modifiedKit.status.push(newStatus);

    if(status === kitsStatusesEnum.Assigned) {
      modifiedKit.investigatorId = kitData.investigatorId;
    }

    await this.updateEntityAsync(studyKitsDSU, FoldersEnum.StudyKits);
    //update kits database
    const kitRecord =  await this.addStudyKitDataToDb(kitDSU.studyId, studyKitsDSU);

    this.communicationService.sendMessage(CommunicationService.identities.CSC.SPONSOR_IDENTITY, {
        operation: status,
        data: { kitSSI: kitSSI },
        shortDescription: status
      }
    );

    return kitRecord;
  }

  async getStudyKitsDSUAndUpdate(studyKeySSI) {
    let studyKitsDSU;
    try {
      studyKitsDSU = await this.getEntityAsync(studyKeySSI, FoldersEnum.StudyKits);
    } catch (e) {
      await this.mountEntityAsync(studyKeySSI, FoldersEnum.StudyKits);
      studyKitsDSU = await this.getEntityAsync(studyKeySSI, FoldersEnum.StudyKits);
    }
    //synchronization will be performed later on user demand
    studyKitsDSU.synchronized = false;
    return await this.addStudyKitDataToDb(studyKitsDSU.studyId, studyKitsDSU);
  }

  async mountStudyKits(studyKeySSI, progressCallback){
    const studyKitsDSU = await this.getEntityAsync(studyKeySSI, FoldersEnum.StudyKits);
    //use batch-mode?
    for (let i = 0; i < studyKitsDSU.kits.length; i++) {
        let kit = studyKitsDSU.kits[i];
        await this.mountEntityAsync(kit.kitKeySSI, FoldersEnum.Kits);
        progressCallback(undefined, (i + 1) / studyKitsDSU.kits.length)
    }
  }

  async updateStudyKitRecordKitSSI(kitSSI, status) {
    let kitDetails;
     // kits were not synchronized yet so mount this kit it anyway
     try{
       kitDetails = await this.getKitsDSU(kitSSI);
     }
     catch (e){
       kitDetails = await this.mountEntityAsync(kitSSI, FoldersEnum.Kits);
     }
    let studyKitDb = await this.storageService.getRecord(this.KITS_TABLE, kitDetails.studyId);
    let modifiedKit = studyKitDb.kits.find((kit) => {
      return kit.kitKeySSI === kitSSI;
    });
    modifiedKit.status = kitDetails.status;
    if (status === kitsStatusesEnum.Assigned) {
      modifiedKit.investigatorId = kitDetails.investigatorId;
    }
    return await this.storageService.updateRecord(this.KITS_TABLE, kitDetails.studyId, studyKitDb);
  }
}

module.exports = KitsService;
