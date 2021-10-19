const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService.js');
const ShipmentsService = require('./ShipmentsService.js');
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

  async addStudyKitDataTODb(studyId, studyKitData) {
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
    return await this.addStudyKitDataTODb(studyId, studyKitsDSU);
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
}

module.exports = KitsService;
