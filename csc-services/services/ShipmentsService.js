const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require("./lib/DSUService");
const { Roles, messagesEnum, shipment, FoldersEnum } = require('./constants');
const NotificationsService = require('./lib/NotificationService.js');
const eventBusService = require('./lib/EventBusService.js');
const CommunicationService = require('./lib/CommunicationService.js');


class ShipmentsService extends DSUService {
  SHIPMENTS_TABLE = 'shipments';
  SHIPMENTS_FOLDER = '/shipments';

  constructor(DSUStorage, communicationService) {
    super(DSUStorage, '/shipments');
    if (communicationService) {
      this.communicationService = communicationService;
    }
    this.storageService = getSharedStorage(DSUStorage);
    this.notificationsService = new NotificationsService(DSUStorage);
    this.DSUStorage = DSUStorage;
  }

  async addShipmentToDB(data, key) {
    console.log('Data: ', JSON.stringify(data));
    const newRecord = await this.storageService.insertRecord(this.SHIPMENTS_TABLE, key ? key : data.orderId, data);
    return newRecord;
  }

  async getShipments() {
    const result = await this.storageService.filter(this.SHIPMENTS_TABLE);
    if (result) {
      return result.filter((x) => !x.deleted);
    } else return [];
  }

  sendMessageToEntity(entity, operation, data, shortDescription) {
    this.communicationService.sendMessage(entity, {
      operation,
      data,
      shortDescription,
    });
  }


  // -> Functions for creation of shipment
  async createShipment(data) {

    const shipmentModel = {
      sponsorId: data.sponsorId,
      targetCmoId: data.targetCmoId,
      studyId: data.studyId,
      orderId: data.orderId,
      siteId: data.siteId,
      siteRegionId: data.siteRegionId,
      siteCountry: data.siteCountry,
      temperatures: data.keep_between_temperature,
      temperature_comments: data.temperature_comments,
      requestDate: data.requestDate,
      deliveryDate: data.deliveryDate,
      lastModified: data.lastModified,
    };
    console.log('shipmentmodel: ', JSON.stringify(shipmentModel));
    const shipment = await this.saveEntityAsync(shipmentModel);
    const shipmentDb = await this.addShipmentToDB(
      {
        ...shipmentModel,
        shipmentSSI: shipment.uid,

      },
      shipment.uid
    );

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SPONSOR_IDENTITY,
      messagesEnum.ShipmentInPreparation,
      {
        shipmentSSI: shipment.uid,
      },
      messagesEnum.ShipmentInPreparation
    );

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SITE_IDENTITY,
      messagesEnum.ShipmentInPreparation,
      {
        shipmentSSI: shipment.uid,
      },
      messagesEnum.ShipmentInPreparation
    );

    return shipmentDb;

  }

  // -> Functions for mounting newly created shipment in other actors except cmo
  async mountAndReceiveShipment(shipmentSSI, role, statusKeySSI) {
    let shipment, shipmentDb, status;
    switch (role) {
      case Roles.Sponsor:
        shipment = await this.mountEntityAsync(shipmentSSI, FoldersEnum.Shipments);
        status = await this.mountEntityAsync(statusKeySSI, FoldersEnum.Statuses);

        shipmentDb = await this.addShipmentToDB(
          {
            ...shipment,
            shipmentSSI: shipment.uid,
            status: status.history,
            statusSSI: status.uid,
          },
          shipment.uid
        );

        return shipmentDb;
      case Roles.Site:
        shipment = await this.mountEntityAsync(shipmentSSI, FoldersEnum.Shipments);
        status = await this.mountEntityAsync(statusKeySSI, FoldersEnum.Statuses);

        shipmentDb = await this.addShipmentToDB(
          {
            ...shipment,
            shipmentSSI: shipment.uid,
            status: status.history,
            statusSSI: status.uid,
          },
          shipment.uid
        );

        return shipmentDb;
    }
  }
}

module.exports = ShipmentsService;
