import getSharedStorage from './SharedDBStorageService.js';
import DSUService from './DSUService.js';
import { demoData, orderStatusesEnum } from '../constants/order.js';

export default class OrdersService extends DSUService {
  ORDERS_TABLE = 'orders';

  constructor(DSUStorage) {
    super(DSUStorage, '/orders');
    this.storageService = getSharedStorage(DSUStorage);
    this.DSUStorage = DSUStorage;
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
    };

    const order = await this.saveEntityAsync(model);

    const path = '/' + this.ORDERS_TABLE + '/' + order.uid + '/' + 'status';
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
}
