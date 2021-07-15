import getSharedStorage from './SharedDBStorageService.js';
import DSUService from './DSUService.js';
import { orderStatusesEnum } from '../constants/order.js';
import { Roles } from '../constants/roles.js';
import NotificationsService from './NotificationService.js';
import { NotificationTypes } from '../constants/notifications.js';
import CommunicationService from './CommunicationService.js';
import { messagesEnum } from '../constants/messages.js';
export default class OrdersService extends DSUService {
  ORDERS_TABLE = 'orders';

  constructor(DSUStorage) {
    super(DSUStorage, '/orders');
    this.storageService = getSharedStorage(DSUStorage);
    this.notificationsService = new NotificationsService(DSUStorage);
    this.DSUStorage = DSUStorage;
    this.communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.SPONSOR_IDENTITY);
  }

  async getOrders() {
    const result = await this.storageService.filter(this.ORDERS_TABLE);
    // return demoData;
    if (result) {
      return result.filter((x) => !x.deleted);
    } else return [];
  }

  async getOrder(keySSI) {
    const order = await this.getEntityAsync(keySSI);
    const status = await this.getStatuses(keySSI);
    return { ...order, status: status.status };
  }

  async getStatuses(orderSSI) {
    const result = await this.getEntitiesAsync('/' + this.ORDERS_TABLE + '/' + orderSSI + '/status');
    return result[0];
  }

  async createOrder(data) {
    const statusDsu = await this.saveEntityAsync(
      {
        status: orderStatusesEnum.Initiated,
      },
      '/statuses'
    );

    const model = {
      sponsorId: data.sponsor_id,
      targetCmoId: data.target_cmo_id,
      studyId: data.study_id,
      orderId: data.order_id,
      siteId: data.site_id,
      siteRegionId: data.site_region_id,
      siteCountry: data.site_country,
      temperatures: data.keep_between_temperature,
      comments: data.add_comment,
      kitIdList: data.kit_id_list,
      temperature_comments: data.temperature_comments,
      requestDate: new Date().toISOString(),
      deliveryDate: data.delivery_date,
      lastModified: new Date().toISOString(),
      statusSSI: statusDsu.uid,
      status: statusDsu.status,
    };

    const order = await this.saveEntityAsync(model);

    const documentsDSU = await this.saveEntityAsync(
      { documents: data.files.map((x) => ({ name: x.name })) },
      '/documents'
    );
    console.log(documentsDSU);
    for (const file of data.files) {
      const attachmentKeySSI = await this.uploadFile('/documents' + '/' + documentsDSU.uid + '/' + 'files', file);
      documentsDSU.documents.find((x) => x.name === file.name).attachmentKeySSI = attachmentKeySSI;
    }
    const updatedDocumentsDSU = await this.updateEntityAsync(documentsDSU);

    console.log(updatedDocumentsDSU);

    const path = '/' + this.ORDERS_TABLE + '/' + order.uid + '/' + 'status';
    await this.unmountEntityAsync(statusDsu.uid, '/statuses');
    await this.mountEntityAsync(statusDsu.uid, path);

    const result = await this.addOrderToDB({
      sponsorId: model.sponsorId,
      studyId: model.studyId,
      orderId: model.orderId,
      siteId: model.siteId,
      requestDate: model.requestDate,
      deliveryDate: model.deliveryDate,
      status: statusDsu.status,
      statusSSI: statusDsu.uid,
      orderSSI: order.uid,
      lastModified: model.lastModified,
      documentsKeySSI: updatedDocumentsDSU.uid,
    });

    let notification = {
      operation: NotificationTypes.UpdateOrderStatus,
      orderId: model.orderId,
      read: false,
      status: orderStatusesEnum.Initiated,
      keySSI: order.uid,
      role: Roles.Sponsor,
      did: '123-56',
      date: new Date().toISOString(),
    };

    const resultNotification = await this.notificationsService.insertNotification(notification);
    console.log('notification:', resultNotification, this.notificationsService);

    this.communicationService.sendMessage(CommunicationService.identities.CSC.CMO_IDENTITY, {
      operation: messagesEnum.StatusInitiated,
      data: {
        orderSSI: order.uid,
        documentsSSI: updatedDocumentsDSU.uid,
      },
      shortDescription: 'Order Initiated',
    });

    return { ...order, status: statusDsu.status };
  }

  async deleteOrder(id) {
    const selectedOrder = await this.storageService.getRecord(this.ORDERS_TABLE, id);

    const updatedTrial = await this.storageService.updateRecord(this.ORDERS_TABLE, selectedOrder.id, {
      ...selectedTrial,
      deleted: true,
    });

    return;
  }

  async addOrderToDB(data) {
    const newRecord = await this.storageService.insertRecord(this.ORDERS_TABLE, data.orderId, data);
    return newRecord;
  }

  uploadFile(path, file) {
    return new Promise((resolve, reject) => {
      this.DSUStorage.uploadFile(path, file, undefined, (err, keySSI) => {
        if (err) {
          reject(new Error(err));
          return;
        }
        resolve(keySSI);
      });
    });
  }
}
