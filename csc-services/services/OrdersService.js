const DSUService = require('./lib/DSUService.js');
const { Roles, messagesEnum, order, FoldersEnum } = require('./constants');
const orderStatusesEnum = order.orderStatusesEnum;
const {getCommunicationServiceInstance} = require("./lib/CommunicationService");
const EncryptionService = require('./lib/EncryptionService.js');
class OrdersService extends DSUService {
  ORDERS_TABLE = 'orders';

  constructor() {
    super(FoldersEnum.Orders);
    this.communicationService = getCommunicationServiceInstance();
  }


  async getOrders() {
    const result = await this.storageService.filter(this.ORDERS_TABLE);
    return result ? result : [];
  }

  async getOrder(keySSI) {
    let order;
    //this is the SITE who will thrown an error because it doesn't have order mounted but the orderKeySSI is in the shipment
    //TODO check with business this requirement
    try{
      order = await this.storageService.getRecord(this.ORDERS_TABLE, keySSI);
    }
    catch (e){
      const orderDataDSU = await this.mountEntityAsync(keySSI,FoldersEnum.Orders);
      order = await this.storageService.insertRecord(this.ORDERS_TABLE, keySSI,orderDataDSU);
    }
    return order;

  }

  async addOrderToDB(data, key) {
    return await this.storageService.insertRecord(this.ORDERS_TABLE, key ? key : data.orderId, data);
  }

  async updateOrderToDB(data, key) {
    return await this.storageService.updateRecord(this.ORDERS_TABLE, key ? key : data.orderId, data);
  }

  // -> Utils
  uploadFile(path, file) {
    function getFileContentAsBuffer(file, callback) {
      let fileReader = new FileReader();
      fileReader.onload = function (evt) {
        let arrayBuffer = fileReader.result;
        callback(undefined, arrayBuffer);
      };

      fileReader.readAsArrayBuffer(file);
    }

    return new Promise((resolve, reject) => {
      getFileContentAsBuffer(file, (err, arrayBuffer) => {
        if (err) {
          return reject('Could not get file as a Buffer');
        }
        this.DSUStorage.writeFile(path, $$.Buffer.from(arrayBuffer), undefined, (err, keySSI) => {
          if (err) {
            return reject(new Error(err));
          }
          resolve();
        });
      });
    });
  }

  sendMessageToEntity(entity, operation, data, shortDescription) {
    this.communicationService.sendMessage(entity, {
      operation,
      data,
      shortDescription,
    });
  }

  // -> Functions for creation of order

  async createOrder(data) {

    try{
      this.storageService.beginBatch();
    }
    catch (e){
      console.log(e);
    }
    const studyData = {
      studyId: data.study_id,
      studyDurationFrom:data.study_duration_from,
      studyDurationTo:data.study_duration_to,
    }

    const statusData = {  history: [{ status: orderStatusesEnum.Initiated, date: new Date().getTime() }]}
    const kitIdsData = {
      kitIds:data.kitIds,
      studyData:studyData,
      file: {
        name: data.kitIdsFile.name,
        attached_by: Roles.Sponsor,
        date: new Date().getTime(),
      },};
    const { statusDsu, kitIdsDsu } = await this.createOrderOtherDSUs(statusData,kitIdsData) ;

    const statusDsuKeySSI = statusDsu.keySSI;

    await this.addKitsFileToDsu(kitIdsDsu, data.kitIdsFile);
    const kitIdKeySSIEncrypted = await EncryptionService.encryptData(kitIdsDsu.sReadSSI);
    const comment = { entity:  '<' + Roles.Sponsor + '> (' +  data.sponsor_id + ')' , comment: data.add_comment, date: new Date().getTime() };

    const orderModel = {
      sponsorId: data.sponsor_id,
      targetCmoId: data.target_cmo_id,
      ...studyData,
      orderId: data.order_id,
      siteId: data.site_id,
      siteRegionId: data.site_region_id,
      siteCountry: data.site_country,
      temperatures: data.keep_between_temperature,
      temperature_comments: data.temperature_comments,
      requestDate: new Date().getTime(),
      deliveryDate: data.delivery_date,
      comments: [comment],
      kitIdKeySSIEncrypted:kitIdKeySSIEncrypted
    };

    const order = await this.saveOrderDsu(orderModel, data.files, Roles.Sponsor);
    const orderDb = await this.addOrderToDB(
      {
        ...orderModel,
        orderSSI: order.keySSI,
        status: statusDsu.history,
        statusSSI: statusDsuKeySSI,
        kitsSSI: kitIdsDsu.uid,
        kitsFilename: kitIdsDsu.file.name,
      },
      order.uid
    );
    await this.storageService.commitBatch();

    this.sendMessageToEntity(
      order.targetCmoId,
      messagesEnum.StatusInitiated,
      {
        orderSSI: order.sReadSSI,
        kitIdsKeySSI: kitIdsDsu.sReadSSI,
        statusKeySSI: statusDsuKeySSI,
      },
      'Order Initiated'
    );

    return orderDb;
  }

  async createOrderOtherDSUs(statusData, kitIdsData) {
    const statusDsuPromise = this.saveEntityAsync(
      statusData,
      FoldersEnum.Statuses
    );

    const kitIdsDsuPromise = this.saveEntityAsync(
      kitIdsData,
      FoldersEnum.KitIds
    );

    const promisesValues = await Promise.allSettled([statusDsuPromise, kitIdsDsuPromise]);
    return { statusDsu: promisesValues[0].value, kitIdsDsu: promisesValues[1].value };
  }

  async updateStatusDsu(newStatus, knownIdentifier) {
    const uid = await this.getEntityPathAsync(knownIdentifier,FoldersEnum.Statuses);
    const statusDsu = await this.getEntityAsync(uid, FoldersEnum.Statuses);
    const result = await this.updateEntityAsync(
      {
        ...statusDsu,
        history: [...statusDsu.history, { status: newStatus, date: new Date().getTime() }],
      },
      FoldersEnum.Statuses
    );
    return result;
  }

  async saveOrderDsu(orderData, files, role) {
    orderData.documents = [
      ...files.map((x) => ({
        name: x.name,
        attached_by: role,
        date: new Date().getTime(),
      })),
    ]
    const order = await this.saveEntityAsync(orderData,FoldersEnum.Orders);

    for (const file of files) {
      await this.uploadFile(FoldersEnum.Orders + '/' + order.uid + '/' + 'files' + '/' + file.name, file);
    }

    return order;
  }

  async addKitsFileToDsu(kitsDsu,file) {
     await this.uploadFile(FoldersEnum.KitIds + '/' + kitsDsu.uid + '/' + 'files' + '/' + file.name, file);
  }

  // -> Functions for mounting newly created order in other actors except sponsor
  async mountAndReceiveOrder(orderSSI, role, attachedDSUKeySSIs) {
    let order, kits, orderDb, status;
    switch (role) {
      case Roles.CMO:
        order = await this.mountEntityAsync(orderSSI, FoldersEnum.Orders);
        status = await this.mountEntityAsync(attachedDSUKeySSIs.statusKeySSI, FoldersEnum.Statuses);
        kits = await this.mountEntityAsync(attachedDSUKeySSIs.kitIdsKeySSI, FoldersEnum.KitIds);

        orderDb = await this.addOrderToDB(
          {
            ...order,
            orderSSI: order.uid,
            status: status.history,
            statusSSI: attachedDSUKeySSIs.statusKeySSI,
            kitsSSI: kits.uid,
            kitsFilename: kits.file.name,
          },
          order.uid
        );

        return orderDb;
    }
  }

  // -> Function for reviewing, canceling, approving orders.

  async updateOrder(orderUID, comment, role, newStatus, otherDetails) {
    try{
      this.storageService.beginBatch();
    }
    catch (e){
      console.log(e);
    }
    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderUID);

    if (newStatus) {
      const status = await this.updateStatusDsu(newStatus, orderDB.statusSSI);
      orderDB.status = status.history;
    }

    if (comment) {
      const orderDSU = await this.getEntityAsync(orderUID,FoldersEnum.Orders);
      orderDSU.comments.push(comment);
      orderDB.comments.push(comment);
      await this.updateEntityAsync(orderDSU,FoldersEnum.Orders);
    }

    if (otherDetails) {
      Object.keys(otherDetails).forEach((key) => {
        orderDB[key] = otherDetails[key];
      });
    }

    const result = await this.updateOrderToDB(orderDB, orderUID);

    await this.storageService.commitBatch();

    let identity = role === Roles.CMO ? orderDB.sponsorId : orderDB.targetCmoId;

    if (newStatus) {
      this.sendMessageToEntity(identity, newStatus, { orderSSI: orderUID }, "Order Updated");
    }

    return result;
  }

  // -> Function for updating changed order locally

  async updateLocalOrder(orderKeySSI, otherDetails) {
    const orderDSU = await this.getEntityAsync(orderKeySSI,FoldersEnum.Orders);
    let orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderKeySSI);
    const statusIdentifier = await this.getEntityPathAsync(orderDB.statusSSI, FoldersEnum.Statuses);
    const status = await this.getEntityAsync(statusIdentifier, FoldersEnum.Statuses);
    orderDB.status = status.history;
    orderDB = {...orderDB, ...orderDSU};

    if (otherDetails) {
      Object.keys(otherDetails).forEach((key) => {
        orderDB[key] = otherDetails[key];
      });
    }

    return await this.updateOrderToDB(orderDB, orderKeySSI);
  }

}

module.exports = OrdersService;
