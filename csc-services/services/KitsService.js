const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService.js');
const { Roles, messagesEnum, order, FoldersEnum, kit } = require('./constants');
const kitsDummyData = kit.kitsDummyData;
const CommunicationService = require('./lib/CommunicationService.js');
const ShipmentsService = require('./ShipmentsService.js');
const moment = require('./lib/moment.min');

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

	async getAllKits() {
		const shipments = await this.shipmentsService.getShipments();
		if (shipments && shipments.length > 0) {
			let kits = [];
			for (const shipment of shipments) {
				const temp = await this.getKits(shipment.shipmentId);
				if (temp && temp.length > 0) {
					kits = [...kits, ...temp];
				}
			}
			return kits;
			// return kitsDummyData;
		} else {
      //TODO: remove at some point
      const testingValues = await this.getKits("SHIPMENT-ID-001");
      if (testingValues && testingValues.length > 0) {
        return testingValues;
      }
			else return [];
		}
	}

	async getKits(shipmentId) {
    const result = await this.storageService.filter(`${this.KITS_TABLE}_${shipmentId}`);
    return result ? result : [];
  }

	async getKit(shipmentId, kitId) {
		const kit = await this.storageService.getRecord(`${this.KITS_TABLE}_${shipmentId}`, kitId);
	}

	async addKit(shipmentId, data) {
		const newRecord = await this.storageService.insertRecord(`${this.KITS_TABLE}_${shipmentId}`, data.kitId, data);
    return newRecord;
	}

  async updateKit(shipmentId, data) {
    const updatedRecord = await this.storageService.updateRecord(`${this.KITS_TABLE}_${shipmentId}`, data.kitId, data);
    return updatedRecord;
  }

  sendMessageToEntity(entity, operation, data, shortDescription) {
    this.communicationService.sendMessage(entity, {
      operation,
      data,
      shortDescription,
    });
  }

	// TODO: does not work until we decide form of the kitsId array
	async updateKitsToDsu(kitsKeySSI, kitsData) {
    const kitsDataDsu = await this.getEntityAsync(kitsKeySSI, FoldersEnum.Kits);
		// TODO: does not work until we decide form of the kitsId array
    const updatedDSU = await this.updateEntityAsync(
      {
        ...kitsDataDsu,
				kitIds: kitsData
      },
      FoldersEnum.Kits
    );

    const result = await this.updateEntityAsync(updatedDSU, FoldersEnum.Kits);
    return result;
  }

	// TODO: does not work until we decide form of the kitsId array
	async updateKitToDsu(kitsKeySSI, kitId, kitData) {
    const kitsDataDsu = await this.getEntityAsync(kitsKeySSI, FoldersEnum.Kits);
		const selectedKit = kitsDataDsu.find(x => x.kitId === kitId);
    const updatedDSU = await this.updateEntityAsync(
      {
        ...kitsDataDsu,
        // include array of kitIds with objects including new attributes needed ->
				kitIds: [...kitsDataDsu.kitIds, ...kitData]
      },
      FoldersEnum.Kits
    );

    const result = await this.updateEntityAsync(updatedDSU, FoldersEnum.Kits);
    return result;
  }

	// TODO: does not work until we decide form of the kitsId array
  async updateKitToDbFromDSU(kitsKeySSI, kitId, shipmentId) {
    const kit = await this.getEntityAsync(kitsKeySSI, FoldersEnum.Kits);
    const kitFromDb = await this.storageService.getRecord(`${this.KITS_TABLE}_${shipmentId}`, kitId);
    const updatedKit = kit.kitIds.find(x => x.kitId === kitId);

    const result = await this.updateKit(shipmentId, updatedKit);
    return result;
  }
}

module.exports = KitsService;
