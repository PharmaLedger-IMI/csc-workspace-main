import getSharedStorage from './SharedDBStorageService.js';
import DSUService from './DSUService.js';
import { orderStatusesEnum } from '../constants/order.js';
import { Roles } from '../constants/roles.js';
import NotificationsService from './NotificationService.js';
import { NotificationTypes } from '../constants/notifications.js';
import CommunicationService from './CommunicationService.js';
import { messagesEnum } from '../constants/messages.js';
import eventBusService from '../services/EventBusService.js';
import { Topics } from '../constants/topics.js';

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

  async getOrder(keySSI, documentsKeySSI) {
    const order = await this.getEntityAsync(keySSI);
    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, order.orderId);
    const status = await this.getStatuses(keySSI);
    const documents = await this.getEntityAsync(documentsKeySSI, '/documents');
    if (orderDB.cmoDocumentsSSI) {
      const cmoDocuments = await this.getEntityAsync(orderDB.cmoDocumentsSSI, '/documents');
      return { ...order, status: status.status, documents: [...documents.documents, ...cmoDocuments.documents] };
    }
    return { ...order, status: status.status, documents: documents.documents };
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
      comments: [{ entity: Roles.Sponsor, comment: data.add_comment, date: new Date().toISOString() }],
      kitIdList: data.kit_id_list,
      temperature_comments: data.temperature_comments,
      requestDate: new Date().toISOString(),
      deliveryDate: data.delivery_date,
      lastModified: new Date().toISOString(),
      statusSSI: statusDsu.uid,
      status: statusDsu.status,
      history: [{ status: orderStatusesEnum.Initiated, date: new Date().toISOString() }],
    };

    const order = await this.saveEntityAsync(model);

    const documentsDSU = await this.saveEntityAsync(
      {
        documents: data.files.map((x) => ({
          name: x.name,
          attached_by: Roles.Sponsor,
          date: new Date().toISOString(),
        })),
      },
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

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.CMO_IDENTITY,
      messagesEnum.StatusInitiated,
      {
        orderSSI: order.uid,
        documentsSSI: updatedDocumentsDSU.uid,
      },
      'Order Initiated'
    );

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SITE_IDENTITY,
      messagesEnum.StatusInitiated,
      {
        orderSSI: order.uid,
        documentsSSI: updatedDocumentsDSU.uid,
      },
      'Order Initiated'
    );

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

  async reviewedByCmo(orderSSI, cmoDocumentsSSI, comments) {
    const order = await this.getEntityAsync(orderSSI);
    await this.mountEntityAsync(cmoDocumentsSSI, '/documents');
    const cmoDocuments = await this.getEntityAsync(cmoDocumentsSSI, '/documents');
    const updatedComments = [
      ...order.comments,
      ...comments.map((x) => ({ entity: Roles.CMO, comment: x, date: new Date().toISOString() })),
    ];
    const updatedOrder = {
      ...order,
      status: orderStatusesEnum.ReviewedByCMO,
      comments: updatedComments,
      history: [...order.history, { status: orderStatusesEnum.ReviewedByCMO, date: new Date().toISOString() }],
    };
    await this.updateEntityAsync(updatedOrder);

    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, order.orderId);
    const updatedOrderDB = await this.storageService.updateRecord(this.ORDERS_TABLE, order.orderId, {
      ...orderDB,
      cmoDocumentsSSI: cmoDocumentsSSI,
      status: orderStatusesEnum.ReviewedByCMO,
    });

    console.log(updatedOrderDB);

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.CMO_IDENTITY,
      messagesEnum.StatusReviewedByCMO,
      {
        orderSSI: order.uid,
        cmoDocumentsSSI,
      },
      'Order Reviewed by CMO'
    );

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SITE_IDENTITY,
      messagesEnum.StatusReviewedByCMO,
      {
        orderSSI: order.uid,
      },
      'Order Reviewed by CMO'
    );

    return updatedOrderDB;
  }

  sendMessageToEntity(entity, operation, data, shortDescription) {
    this.communicationService.sendMessage(entity, {
      operation,
      data,
      shortDescription,
    });
  }

  async finishReview(comments, orderSSI) {
    const order = await this.getEntityAsync(orderSSI);
    const updatedComments = [
      ...order.comments,
      ...comments.map((x) => ({ entity: Roles.Sponsor, comment: x, date: new Date().toISOString() })),
    ];
    const updatedOrder = {
      ...order,
      status: orderStatusesEnum.ReviewedBySponsor,
      comments: updatedComments,
      history: [...order.history, { status: orderStatusesEnum.ReviewedBySponsor, date: new Date().toISOString() }],
    };
    await this.updateEntityAsync(updatedOrder);

    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, order.orderId);
    const updatedOrderDB = await this.storageService.updateRecord(this.ORDERS_TABLE, order.orderId, {
      ...orderDB,
      status: orderStatusesEnum.ReviewedBySponsor,
    });

    console.log(updatedOrderDB);

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.CMO_IDENTITY,
      messagesEnum.StatusReviewedBySponsor,
      {
        orderSSI: order.uid,
      },
      'Order Reviewed by Sponsor'
    );

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SITE_IDENTITY,
      messagesEnum.StatusReviewedBySponsor,
      {
        orderSSI: order.uid,
      },
      'Order Reviewed by Sponsor'
    );

    return updatedOrderDB;
  }
}
