const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require("./lib/DSUService");
const { Roles, messagesEnum, shipment, FoldersEnum } = require('./constants');
const shipmentStatusesEnum = shipment.shipmentStatusesEnum;
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

    const { statusDsu } = await this.createShipmentOtherDSUs();

    const status = await this.updateStatusDsu(shipmentStatusesEnum.InPreparation, statusDsu.uid);

    const shipmentModel = {
      sponsorId: data.sponsorId,
      targetCmoId: data.targetCmoId,
      studyId: data.studyId,
      orderId: data.orderId,
      siteId: data.siteId,
      siteRegionId: data.siteRegionId,
      siteCountry: data.siteCountry,
      temperatures: data.keep_between_temperature,
      temperature_comments: data.temperatures,
      requestDate: data.requestDate,
      deliveryDate: data.delivery_date,
      lastModified: data.lastModified,
    };

    const shipment = await this.saveEntityAsync(shipmentModel);

    const shipmentDb = await this.addShipmentToDB(
      {
      ...shipmentModel,
      shipmentSSI: shipment.uid,
      status: status.history,
      statusSSI: status.uid,

      },
      shipment.uid
    );

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SPONSOR_IDENTITY,
      messagesEnum.ShipmentInPreparation,
      {
        shipmentSSI: shipment.uid,
        statusKeySSI: statusDsu.uid,
      },
      messagesEnum.ShipmentInPreparation
    );

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SITE_IDENTITY,
      messagesEnum.ShipmentInPreparation,
      {
        shipmentSSI: shipment.uid,
        statusKeySSI: statusDsu.uid,
      },
      messagesEnum.ShipmentInPreparation
    );

    return shipmentDb;
  }

  async createShipmentOtherDSUs() {

    const statusDsu = await this.saveEntityAsync(
      {
        history: [],
      },
      FoldersEnum.ShipmentsStatuses
    );

    return { statusDsu };

  }

  async updateStatusDsu(newStatus, keySSI) {
    const statusDsu = await this.getEntityAsync(keySSI, FoldersEnum.ShipmentsStatuses);
    const result = await this.updateEntityAsync(
      {
        ...statusDsu,
        history: [...statusDsu.history, { status: newStatus, date: new Date().getTime() }],
      },
      FoldersEnum.ShipmentsStatuses
    );
    return result;
  }


  // -> Functions for mounting newly created shipment in other actors except cmo
  async mountAndReceiveShipment(shipmentSSI, role, statusKeySSI) {
    let shipment, shipmentDb, status;
    switch (role) {
      case Roles.Sponsor:
        shipment = await this.mountEntityAsync(shipmentSSI, FoldersEnum.Shipments);
        status = await this.mountEntityAsync(statusKeySSI, FoldersEnum.ShipmentsStatuses);

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
        status = await this.mountEntityAsync(statusKeySSI, FoldersEnum.ShipmentsStatuses);

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