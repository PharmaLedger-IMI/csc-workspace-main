import getSharedStorage from './SharedDBStorageService.js';
import DSUService from './DSUService.js';
import { demoData } from '../constants/order.js';

export default class OrdersService extends DSUService {
  ORDERS_TABLE = 'orders';

  constructor(DSUStorage) {
    super(DSUStorage, '/orders');
    this.storageService = getSharedStorage(DSUStorage);
    this.DSUStorage = DSUStorage;
  }

  async getOrders() {
    // const result = await this.storageService.filter(this.ORDERS_TABLE);
    return demoData;
    if (result) {
      return result.filter((x) => !x.deleted);
    } else return [];
  }

  async getOrder(keySSI) {
    const result = await this.getEntityAsync(keySSI);
    return result;
  }

  async createOrder(data) {
    const order = await this.saveEntityAsync(data);
    await this.addOrderToDB({
      id: order.id,
      keySSI: order.uid,
      name: order.name,
      status: order.status,
      countries: order.countries,
    });
    return order;
  }

  async deleteOrder(id) {
    const selectedOrder = await this.storageService.getRecord(this.ORDERS_TABLE, id);

    const updatedTrial = await this.storageService.updateRecord(this.ORDERS_TABLE, selectedOrder.id, {
      ...selectedTrial,
      deleted: true,
    });
  }

  async addTrialToDB(data) {
    const newRecord = await this.storageService.insertRecord(this.TRIALS_TABLE, data.id, data);
    return newRecord;
  }
}
