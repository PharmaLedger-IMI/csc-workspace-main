const getSharedStorage = require("./lib/SharedDBStorageService.js").getSharedStorage;
const DSUService = require('./lib/DSUService.js');
const {Roles, NotificationTypes, Topics, messagesEnum, order} = require('./constants');
const orderStatusesEnum = order.orderStatusesEnum;
const NotificationsService = require('./lib/NotificationService.js');
const eventBusService = require('./lib/EventBusService.js');
const CommunicationService = require('./lib/CommunicationService.js');

class OrdersService extends DSUService {
    ORDERS_TABLE = 'orders';

    constructor(DSUStorage) {
        super(DSUStorage, '/orders');
        this.storageService = getSharedStorage(DSUStorage);
        this.notificationsService = new NotificationsService(DSUStorage);
        this.DSUStorage = DSUStorage;
        this.communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.CMO_IDENTITY);
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

    async updateOrder(data) {
        const statusDsu = await this.updateEntityAsync(
            {
                status: orderStatusesEnum.ReviewedByCMO,
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

    async mountOrderReviewedByCMO(keySSI, documentsSSI) {
        await this.unmountEntityAsync(keySSI);
        await this.mountEntityAsync(keySSI);
        const order = await this.getEntityAsync(keySSI);
        console.log('ORDER:', JSON.stringify(order, null, 2));
        const documents = await this.mountEntityAsync(documentsSSI, '/documents');
        // const result = await this.addOrderToDB({ ...order, orderSSI: keySSI, cmoDocumentsSSI: documentsSSI });
        const selectedOrder = await this.storageService.getRecord(this.ORDERS_TABLE, order.orderId);
        const updatedOrder = await this.storageService.updateRecord(this.ORDERS_TABLE, order.orderId, {
            ...selectedOrder,
            cmoDocumentsSSI: documentsSSI,
            status: order.status,
            comments: order.comments,
        });
        console.log('RESULT:', JSON.stringify(updatedOrder, null, 2));
        return updatedOrder;
    }

    async mountOrderReviewedBySponsor(keySSI) {
        await this.unmountEntityAsync(keySSI);
        await this.mountEntityAsync(keySSI);
        const order = await this.getEntityAsync(keySSI);
        console.log('ORDER:', JSON.stringify(order, null, 2));
        const selectedOrder = await this.storageService.getRecord(this.ORDERS_TABLE, order.orderId);
        const updatedOrder = await this.storageService.updateRecord(this.ORDERS_TABLE, order.orderId, {
            ...selectedOrder,
            status: order.status,
            comments: order.comments,
        });
        console.log('RESULT:', JSON.stringify(updatedOrder, null, 2));
        return updatedOrder;
    }

    async addOrderToDB(data) {
        const newRecord = await this.storageService.insertRecord(this.ORDERS_TABLE, data.orderId, data);
        return newRecord;
    }

    async updateOrderToDB(data){
        const newRecord = await this.storageService.updateRecord(this.ORDERS_TABLE, data.orderId, data);
        return newRecord;
    }

    async finishReview(files, comments, orderKeySSI) {
        let documentsKeySSI = false;
        if (files) {
            documentsKeySSI = await this.saveDocuments(files);
        }

        this.communicationService.sendMessage(CommunicationService.identities.CSC.SPONSOR_IDENTITY, {
            operation: messagesEnum.StatusReviewedByCMO,
            data: {
                orderSSI: orderKeySSI,
                cmoDocumentsSSI: documentsKeySSI,
                comments,
            },
            shortDescription: 'Order Review by CMO',
        });

        return;
    }

    async saveDocuments(files) {
        const documentsDSU = await this.saveEntityAsync(
            {
                documents: files.map((x) => ({
                    name: x.name,
                    attached_by: Roles.CMO,
                    date: new Date().toISOString(),
                })),
            },
            '/documents'
        );
        console.log(documentsDSU);
        for (const file of files) {
            const attachmentKeySSI = await this.uploadFile('/documents' + '/' + documentsDSU.uid + '/' + 'files', file);
            documentsDSU.documents.find((x) => x.name === file.name).attachmentKeySSI = attachmentKeySSI;
        }
        const updatedDocumentsDSU = await this.updateEntityAsync(documentsDSU);

        return documentsDSU.uid;
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