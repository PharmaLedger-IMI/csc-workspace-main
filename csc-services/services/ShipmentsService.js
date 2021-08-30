const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require("./lib/DSUService");
const { Roles, messagesEnum, FoldersEnum } = require('./constants');
const NotificationsService = require('./lib/NotificationService.js');
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
    return await this.storageService.insertRecord(this.SHIPMENTS_TABLE, key ? key : data.shipmentId, data);
  }

  async getShipment(keySSI) {
    return await this.storageService.getRecord(this.SHIPMENTS_TABLE, keySSI);
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
      sponsorId: data.sponsor_id,
      targetCmoId: data.target_cmo_id,
      studyId: data.study_id,
      orderId: data.order_id,
      siteId: data.site_id,
      siteRegionId: data.site_region_id,
      siteCountry: data.site_country,
      temperatures: data.keep_between_temperature,
      temperature_comments: data.temperature_comments,
      requestDate: data.requestDate,
      deliveryDate: data.delivery_date,
      lastModified: data.lastModified,
    };

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