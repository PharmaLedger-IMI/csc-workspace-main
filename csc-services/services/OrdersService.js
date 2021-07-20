 const getSharedStorage = require("./lib/SharedDBStorageService.js").getSharedStorage;
 const DSUService = require('./lib/DSUService.js');
 const orderStatusesEnum = require('./constants/order.js').orderStatusesEnum;
 const Roles = require('./constants/roles.js').Roles;
 const NotificationsService = require('./lib/NotificationService.js');
 const NotificationTypes = require('./constants/notifications.js');
 const eventBusService = require('./lib/EventBusService.js');
 const Topics = require('./constants/topics.js').Topics;

class OrdersService extends DSUService {
    ORDERS_TABLE = 'orders';

    constructor(DSUStorage) {
        super(DSUStorage, '/orders');
        this.storageService = getSharedStorage(DSUStorage);
        this.notificationsService = new NotificationsService(DSUStorage);
        this.DSUStorage = DSUStorage;
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
        const status = await this.getStatuses(keySSI);
        const documents = await this.getEntityAsync(documentsKeySSI, '/documents');
        return { ...order, status: status.status, documents: documents.documents };
    }

    async getStatuses(orderSSI) {
        const result = await this.getEntitiesAsync('/' + this.ORDERS_TABLE + '/' + orderSSI + '/status');
        return result[0];
    }

    async updateOrder(data) {
        const statusDsu = await this.updateEntityAsync(
            {
                status: orderStatusesEnum.ReviewedByCMO,
            },
            '/statuses'
        );

        console.log(statusDsu);

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

        const order = await this.updateEntityAsync(model);

        const path = '/' + this.ORDERS_TABLE + '/' + order.uid + '/' + 'status';
        //await this.mountEntityAsync(statusDsu.uid, path);

        const result = await this.updateOrderToDB({
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

        let notification = {
            operation: NotificationTypes.UpdateOrderStatus,
            orderId: model.orderId,
            read: false,
            status: orderStatusesEnum.Initiated,
            keySSI: order.uid,
            role: Roles.Sponsor,
            did: data.site_id,
            date: new Date().toISOString(),
        };

        const resultNotification = await this.notificationsService.insertNotification(notification);
        console.log('notification:', resultNotification, this.notificationsService);

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

    async mountOrder(keySSI, documentsSSI) {
        const order = await this.mountEntityAsync(keySSI);
        console.log('ORDER:', JSON.stringify(order, null, 2));
        const documents = await this.mountEntityAsync(documentsSSI, '/documents');
        const result = await this.addOrderToDB({ ...order, orderSSI: keySSI, documentsKeySSI: documentsSSI });
        console.log('RESULT:', JSON.stringify(result, null, 2));
        eventBusService.emitEventListeners(Topics.RefreshOrders, null);
        return result;
    }

    async addOrderToDB(data) {
        const newRecord = await this.storageService.insertRecord(this.ORDERS_TABLE, data.orderId, data);
        return newRecord;
    }
    async updateOrderToDB(data){
        const newRecord = await this.storageService.updateRecord(this.ORDERS_TABLE, data.orderId, data);
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

module.exports = OrdersService;