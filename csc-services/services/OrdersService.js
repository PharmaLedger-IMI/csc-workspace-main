const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService.js');
const { Roles, messagesEnum, order, FoldersEnum } = require('./constants');
const orderStatusesEnum = order.orderStatusesEnum;
const {getCommunicationServiceInstance} = require("./lib/CommunicationService");
const JWTService = require('./lib/JWTService.js');
class OrdersService extends DSUService {
  ORDERS_TABLE = 'orders';

  constructor() {
    super(FoldersEnum.Orders);
    this.communicationService = getCommunicationServiceInstance();
    this.storageService = getSharedStorage(this.DSUStorage);
    this.JWTService = new JWTService();
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
      const documentsAndComments = await this.getDocumentsAndComments(order);
      order = {...order, ...documentsAndComments};
    }
    catch (e){
      const orderDataDSU = await this.mountEntityAsync(keySSI,FoldersEnum.Orders);
      order = await this.storageService.insertRecord(this.ORDERS_TABLE, keySSI,orderDataDSU);
      const documentsAndComments = await this.getDocumentsAndComments(order);
      order = {...order, ...documentsAndComments};
    }
    return order

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
    // try{
    //   this.DSUStorage.beginBatch();
    // }
    // catch (e){
    //   console.log(e);
    // }
    const { statusDsu, sponsorDocumentsDsu, kitIdsDsu, commentsDsu } = await this.createOrderOtherDSUs();

    //await $$.promisify(this.DSUStorage.commitBatch)();
    const statusDsuKeySSI = statusDsu.keySSI;
    const status = await this.updateStatusDsu(orderStatusesEnum.Initiated, statusDsuKeySSI);

    const sponsorDocuments = await this.addDocumentsToDsu(data.files, sponsorDocumentsDsu.uid, Roles.Sponsor);

    const studyData = {
      studyId: data.study_id,
      studyDurationFrom:data.study_duration_from,
      studyDurationTo:data.study_duration_to,
    }
    const kits = await this.addKitsToDsu(data.kitIdsFile, data.kitIds, studyData, kitIdsDsu.uid);
    const kitIdJWTVerifiablePresentation = await this.JWTService.createKitsIdsPresentationForSite(data.sponsor_id, data.site_id, kitIdsDsu.sReadSSI);
    const comment = { entity:  '<' + Roles.Sponsor + '> (' +  data.sponsor_id + ')' , comment: data.add_comment, date: new Date().getTime() };
    const comments = await this.addCommentToDsu(comment, commentsDsu.uid);

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
      kitIdJWTVerifiablePresentation: kitIdJWTVerifiablePresentation
    };

    const order = await this.saveEntityAsync(orderModel);

    const orderDb = await this.addOrderToDB(
      {
        ...orderModel,
        orderSSI: order.keySSI,
        status: status.history,
        statusSSI: statusDsuKeySSI,
        sponsorDocumentsKeySSI: sponsorDocuments.uid,
        kitsSSI: kits.uid,
        kitsFilename: kits.file.name,
        commentsKeySSI: comments.uid,
      },
      order.uid
    );

    // TODO: send correct type of SSIs (sread, keySSI, etc)
    this.sendMessageToEntity(
      order.targetCmoId,
      messagesEnum.StatusInitiated,
      {
        orderSSI: order.sReadSSI,
        sponsorDocumentsKeySSI: sponsorDocumentsDsu.sReadSSI,
        kitIdsKeySSI: kitIdsDsu.sReadSSI,
        commentsKeySSI: commentsDsu.keySSI,
        statusKeySSI: statusDsuKeySSI,
      },
      'Order Initiated'
    );

    return orderDb;
  }

  async createOrderOtherDSUs() {
    const statusDsu = await this.saveEntityAsync(
      {
        history: [],
      },
      FoldersEnum.Statuses
    );

    const sponsorDocumentsDsu = await this.saveEntityAsync(
      {
        documents: [],
      },
      FoldersEnum.Documents
    );


    const kitIdsDsu = await this.saveEntityAsync(
      {
        kitIds: [],
        file: null,
      },
      FoldersEnum.KitIds
    );

    const commentsDsu = await this.saveEntityAsync(
      {
        comments: [],
      },
      FoldersEnum.Comments
    );

    return { statusDsu, sponsorDocumentsDsu, kitIdsDsu, commentsDsu };
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

  async addDocumentsToDsu(files, uid, role) {
    const documentsDsu = await this.getEntityAsync(uid, FoldersEnum.Documents);

    const updatedDocumentsDSU = await this.updateEntityAsync(
      {
        ...documentsDsu,
        documents: [
          ...documentsDsu.documents,
          ...files.map((x) => ({
            name: x.name,
            attached_by: role,
            date: new Date().getTime(),
          })),
        ],
      },
      FoldersEnum.Documents
    );

    for (const file of files) {
      const attachmentKeySSI = await this.uploadFile(FoldersEnum.Documents + '/' + updatedDocumentsDSU.uid + '/' + 'files' + '/' + file.name, file);
      updatedDocumentsDSU.documents.find((x) => x.name === file.name).attachmentKeySSI = attachmentKeySSI;
    }
    const result = await this.updateEntityAsync(updatedDocumentsDSU, FoldersEnum.Documents);

    return result;
  }

  async addKitsToDsu(file, kitIds, studyData, keySSI) {
    const kitsDataDsu = await this.getEntityAsync(keySSI, FoldersEnum.KitIds);
    const updatedDSU = await this.updateEntityAsync(
      {
        ...kitsDataDsu,
        kitIds,
        studyData,
        file: {
          name: file.name,
          attached_by: Roles.Sponsor,
          date: new Date().getTime(),
        },
      },
      FoldersEnum.KitIds
    );

    const attachmentKeySSI = await this.uploadFile(FoldersEnum.KitIds + '/' + updatedDSU.uid + '/' + 'files' + '/' + file.name, file);
    updatedDSU.file.attachmentKeySSI = attachmentKeySSI;
    const result = await this.updateEntityAsync(updatedDSU, FoldersEnum.KitIds);
    return result;
  }

  async addCommentToDsu(comments, uid) {
    const commentsDsu = await this.getEntityAsync(uid, FoldersEnum.Comments);
    const result = await this.updateEntityAsync(
      {
        ...commentsDsu,
        comments: [...commentsDsu.comments, comments],
      },
      FoldersEnum.Comments
    );
    return result;
  }

  // -> Functions for mounting newly created order in other actors except sponsor

  async mountAndReceiveOrder(orderSSI, role, attachedDSUKeySSIs) {
    let order, sponsorDocuments, kits, comments, orderDb, status;
    switch (role) {
      case Roles.CMO:
        order = await this.mountEntityAsync(orderSSI, FoldersEnum.Orders);
        status = await this.mountEntityAsync(attachedDSUKeySSIs.statusKeySSI, FoldersEnum.Statuses);
        sponsorDocuments = await this.mountEntityAsync(attachedDSUKeySSIs.sponsorDocumentsKeySSI, FoldersEnum.Documents);
        kits = await this.mountEntityAsync(attachedDSUKeySSIs.kitIdsKeySSI, FoldersEnum.KitIds);
        comments = await this.mountEntityAsync(attachedDSUKeySSIs.commentsKeySSI, FoldersEnum.Comments);

        orderDb = await this.addOrderToDB(
          {
            ...order,
            orderSSI: order.uid,
            status: status.history,
            statusSSI: attachedDSUKeySSIs.statusKeySSI,
            sponsorDocumentsKeySSI: sponsorDocuments.uid,
            kitsSSI: kits.uid,
            kitsFilename: kits.file.name,
            commentsKeySSI: comments.uid,
          },
          order.uid
        );

        return orderDb;
    }
  }

  // -> Function for reviewing, canceling, approving orders.

  async updateOrder(orderUID, comment, role, newStatus, otherDetails) {

    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderUID);

    if (newStatus) {
      const status = await this.updateStatusDsu(newStatus, orderDB.statusSSI);
      orderDB.status = status.history;
    }

    if (comment) {
      await this.addCommentToDsu(comment, orderDB.commentsKeySSI);
    }

    if (otherDetails) {
      Object.keys(otherDetails).forEach((key) => {
        orderDB[key] = otherDetails[key];
      });
    }

    const result = await this.updateOrderToDB(orderDB, orderUID);
    let identity = role === Roles.CMO ? orderDB.sponsorId : orderDB.targetCmoId;

    if (newStatus) {
      this.sendMessageToEntity(identity, newStatus, { orderSSI: orderUID }, "Order Updated");
    }

    return result;
  }

  // -> Function for updating changed order locally

  async updateLocalOrder(orderKeySSI, otherDetails) {
    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderKeySSI);
    const statusIdentifier = await this.getEntityPathAsync(orderDB.statusSSI, FoldersEnum.Statuses);
    const status = await this.getEntityAsync(statusIdentifier, FoldersEnum.Statuses);
    orderDB.status = status.history;

    if (otherDetails) {
      Object.keys(otherDetails).forEach((key) => {
        orderDB[key] = otherDetails[key];
      });
    }

    return await this.updateOrderToDB(orderDB, orderKeySSI);
  }

  async getDocumentsAndComments(order) {
    let result = {};
    if (order.sponsorDocumentsKeySSI) {
      const sponsorDocuments = await this.getEntityAsync(order.sponsorDocumentsKeySSI, FoldersEnum.Documents);
      result.sponsorDocuments = sponsorDocuments.documents;
    }
    if (order.commentsKeySSI) {
      const comments = await this.getEntityAsync(order.commentsKeySSI, FoldersEnum.Comments);
      result.comments = comments.comments;
    }

    return result;
  }
}

module.exports = OrdersService;
