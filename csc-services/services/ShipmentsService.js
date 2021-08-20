const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require("./lib/DSUService");
const { messagesEnum, order } = require('./constants');
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
    const newRecord = await this.storageService.insertRecord(this.SHIPMENTS_TABLE, key ? key : data.orderId, data);
    return newRecord;
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
        orderSSI: order.uid,
      },
      'Shipment In Preparation'
    );

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SITE_IDENTITY,
      messagesEnum.ShipmentInPreparation,
      {
        orderSSI: order.uid,
      },
      'Shipment In Preparation'
    );

    return shipmentDb;

  }
}

module.exports = ShipmentsService;