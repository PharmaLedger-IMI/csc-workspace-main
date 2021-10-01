const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService.js');
const { Roles, messagesEnum, order, FoldersEnum } = require('./constants');
const orderStatusesEnum = order.orderStatusesEnum;
const CommunicationService = require('./lib/CommunicationService.js');
const EncryptionService = require('./lib/EncryptionService.js');
class OrdersService extends DSUService {
  ORDERS_TABLE = 'orders';

  constructor(DSUStorage, communicationService) {
    super(DSUStorage, '/orders');
    if (communicationService) {
      this.communicationService = communicationService;
    }
    this.storageService = getSharedStorage(DSUStorage);
    this.DSUStorage = DSUStorage;
  }

  // -> DB functions

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
    const newRecord = await this.storageService.insertRecord(this.ORDERS_TABLE, key ? key : data.orderId, data);
    return newRecord;
  }

  async updateOrderToDB(data, key) {
    const updatedRecord = await this.storageService.updateRecord(this.ORDERS_TABLE, key ? key : data.orderId, data);
    return updatedRecord;
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
          reject('Could not get file as a Buffer');
        }
        this.DSUStorage.writeFile(path, $$.Buffer.from(arrayBuffer), undefined, (err, keySSI) => {
          if (err) {
            reject(new Error(err));
            return;
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
    const { statusDsu, sponsorDocumentsDsu, cmoDocumentsDsu, kitIdsDsu, commentsDsu } = await this.createOrderOtherDSUs();

    const status = await this.updateStatusDsu(orderStatusesEnum.Initiated, statusDsu.uid);

    const sponsorDocuments = await this.addDocumentsToDsu(data.files, sponsorDocumentsDsu.uid, Roles.Sponsor);

    const kits = await this.addKitsToDsu(data.kitIdsFile, data.kitIds, kitIdsDsu.uid);
    const kitIdKeySSIEncrypted = await EncryptionService.encryptData(kitIdsDsu.uid);

    const comment = { entity: Roles.Sponsor, comment: data.add_comment, date: new Date().getTime() };
    const comments = await this.addCommentToDsu(comment, commentsDsu.uid);

    const orderModel = {
      sponsorId: data.sponsor_id,
      targetCmoId: data.target_cmo_id,
      studyId: data.study_id,
      orderId: data.order_id,
      siteId: data.site_id,
      siteRegionId: data.site_region_id,
      siteCountry: data.site_country,
      temperatures: data.keep_between_temperature,
      temperature_comments: data.temperature_comments,
      requestDate: new Date().getTime(),
      deliveryDate: data.delivery_date,
      kitIdKeySSIEncrypted:kitIdKeySSIEncrypted
    };

    const order = await this.saveEntityAsync(orderModel);

    const orderDb = await this.addOrderToDB(
      {
        ...orderModel,
        orderSSI: order.uid,
        status: status.history,
        statusSSI: status.uid,
        sponsorDocumentsKeySSI: sponsorDocuments.uid,
        cmoDocumentsKeySSI: cmoDocumentsDsu.uid,
        kitsSSI: kits.uid,
        kits: kits.kitIds,
        kitsFilename: kits.file.name,
        commentsKeySSI: comments.uid,
      },
      order.uid
    );

    // TODO: send correct type of SSIs (sread, keySSI, etc)
    this.sendMessageToEntity(
      CommunicationService.identities.CSC.CMO_IDENTITY,
      messagesEnum.StatusInitiated,
      {
        orderSSI: order.uid,
        sponsorDocumentsKeySSI: sponsorDocumentsDsu.uid,
        cmoDocumentsKeySSI: cmoDocumentsDsu.uid,
        kitIdsKeySSI: kitIdsDsu.uid,
        commentsKeySSI: commentsDsu.uid,
        statusKeySSI: statusDsu.uid,
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

    const cmoDocumentsDsu = await this.saveEntityAsync(
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
      FoldersEnum.Kits
    );

    const commentsDsu = await this.saveEntityAsync(
      {
        comments: [],
      },
      FoldersEnum.Comments
    );

    return { statusDsu, sponsorDocumentsDsu, cmoDocumentsDsu, kitIdsDsu, commentsDsu };
  }

  async updateStatusDsu(newStatus, keySSI) {
    const statusDsu = await this.getEntityAsync(keySSI, FoldersEnum.Statuses);
    const result = await this.updateEntityAsync(
      {
        ...statusDsu,
        history: [...statusDsu.history, { status: newStatus, date: new Date().getTime() }],
      },
      FoldersEnum.Statuses
    );
    return result;
  }

  async addDocumentsToDsu(files, keySSI, role) {
    const documentsDsu = await this.getEntityAsync(keySSI, FoldersEnum.Documents);

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

  async addKitsToDsu(file, kitIds, keySSI) {
    const kitsDataDsu = await this.getEntityAsync(keySSI, FoldersEnum.Kits);
    const updatedDSU = await this.updateEntityAsync(
      {
        ...kitsDataDsu,
        kitIds,
        file: {
          name: file.name,
          attached_by: Roles.Sponsor,
          date: new Date().getTime(),
        },
      },
      FoldersEnum.Kits
    );

    const attachmentKeySSI = await this.uploadFile(FoldersEnum.Kits + '/' + updatedDSU.uid + '/' + 'files' + '/' + file.name, file);
    updatedDSU.file.attachmentKeySSI = attachmentKeySSI;
    const result = await this.updateEntityAsync(updatedDSU, FoldersEnum.Kits);
    return result;
  }

  async addCommentToDsu(comments, keySSI) {
    const commentsDsu = await this.getEntityAsync(keySSI, FoldersEnum.Comments);
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
    let order, sponsorDocuments, cmoDocuments, kits, comments, orderDb, status;
    switch (role) {
      case Roles.CMO:
        order = await this.mountEntityAsync(orderSSI, FoldersEnum.Orders);
        status = await this.mountEntityAsync(attachedDSUKeySSIs.statusKeySSI, FoldersEnum.Statuses);
        sponsorDocuments = await this.mountEntityAsync(attachedDSUKeySSIs.sponsorDocumentsKeySSI, FoldersEnum.Documents);
        cmoDocuments = await this.mountEntityAsync(attachedDSUKeySSIs.cmoDocumentsKeySSI, FoldersEnum.Documents);
        kits = await this.mountEntityAsync(attachedDSUKeySSIs.kitIdsKeySSI, FoldersEnum.Kits);
        comments = await this.mountEntityAsync(attachedDSUKeySSIs.commentsKeySSI, FoldersEnum.Comments);

        orderDb = await this.addOrderToDB(
          {
            ...order,
            orderSSI: order.uid,
            status: status.history,
            statusSSI: status.uid,
            sponsorDocumentsKeySSI: sponsorDocuments.uid,
            cmoDocumentsKeySSI: cmoDocuments.uid,
            kitsSSI: kits.uid,
            kits: kits.kitIds,
            kitsFilename: kits.file.name,
            commentsKeySSI: comments.uid,
          },
          order.uid
        );

        return orderDb;
    }
  }

  // -> Function for reviewing, canceling, approving orders.

  async updateOrderNew(orderKeySSI, files, comment, role, newStatus, otherDetails) {
    let documents = null;
    let comments = null;

    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderKeySSI);

    if (newStatus) {
      const status = await this.updateStatusDsu(newStatus, orderDB.statusSSI);
      orderDB.status = status.history;
    }

    if (files) {
      documents = await this.addDocumentsToDsu(files, role === Roles.CMO ? orderDB.cmoDocumentsKeySSI : orderDB.sponsorDocumentsKeySSI, role);
    }
    if (comment) {
      comments = await this.addCommentToDsu(comment, orderDB.commentsKeySSI);
    }

    if (otherDetails) {
      Object.keys(otherDetails).forEach((key) => {
        orderDB[key] = otherDetails[key];
      });
    }

    const result = await this.updateOrderToDB(orderDB, orderKeySSI);
    let identity = role === Roles.CMO ? CommunicationService.identities.CSC.SPONSOR_IDENTITY : CommunicationService.identities.CSC.CMO_IDENTITY;

    if (newStatus) {
      this.communicationService.sendMessage(identity, {
        operation: newStatus,
        data: {
          orderSSI: orderKeySSI,
        },
        shortDescription: 'Order Updated',
      });
    }

    return result;
  }

  // -> Function for updating changed order locally

  async updateLocalOrder(orderKeySSI, otherDetails) {
    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderKeySSI);
    const status = await this.getEntityAsync(orderDB.statusSSI, FoldersEnum.Statuses);
    orderDB.status = status.history;

    if (otherDetails) {
      Object.keys(otherDetails).forEach((key) => {
        orderDB[key] = otherDetails[key];
      });
    }

    const result = await this.updateOrderToDB(orderDB, orderKeySSI);
    return result;
  }

  async getDocumentsAndComments(order) {
    let result = {};
    if (order.sponsorDocumentsKeySSI) {
      const sponsorDocuments = await this.getEntityAsync(order.sponsorDocumentsKeySSI, FoldersEnum.Documents);
      result.sponsorDocuments = sponsorDocuments.documents;
    }
    if (order.cmoDocumentsKeySSI) {
      const cmoDocuments = await this.getEntityAsync(order.cmoDocumentsKeySSI, FoldersEnum.Documents);
      result.cmoDocuments = cmoDocuments.documents;
    }
    if (order.commentsKeySSI) {
      const comments = await this.getEntityAsync(order.commentsKeySSI, FoldersEnum.Comments);
      result.comments = comments.comments;
    }

    return result;
  }
}

module.exports = OrdersService;
