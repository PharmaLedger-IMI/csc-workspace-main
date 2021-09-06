const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService.js');
const { Roles, NotificationTypes, Topics, messagesEnum, order, FoldersEnum } = require('./constants');
const orderStatusesEnum = order.orderStatusesEnum;
const NotificationsService = require('./lib/NotificationService.js');
const eventBusService = require('./lib/EventBusService.js');
const CommunicationService = require('./lib/CommunicationService.js');
const moment = require('./lib/moment.min');

class OrdersService extends DSUService {
  ORDERS_TABLE = 'orders';
  ORDERS_FOLDER = '/orders';

  constructor(DSUStorage, communicationService) {
    super(DSUStorage, '/orders');
    if (communicationService) {
      this.communicationService = communicationService;
    }
    this.storageService = getSharedStorage(DSUStorage);
    this.notificationsService = new NotificationsService(DSUStorage);
    this.DSUStorage = DSUStorage;
  }

  // -> DB functions

  async getOrders() {
    const result = await this.storageService.filter(this.ORDERS_TABLE);
    return result ? result : [];
  }

  async getOrder(keySSI) {
    return await this.storageService.getRecord(this.ORDERS_TABLE, keySSI);
  }

  async addOrderToDB(data, key) {
    const newRecord = await this.storageService.insertRecord(this.ORDERS_TABLE, key ? key : data.orderId, data);
    return newRecord;
  }

  async updateOrderToDB(data, key) {
    console.log('Updating', data);
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
    };

    const order = await this.saveEntityAsync(orderModel);

    const orderDb = await this.addOrderToDB(
      {
        ...orderModel,
        orderSSI: order.uid,
        status: status.history,
        statusSSI: status.uid,
        sponsorDocumentsKeySSI: sponsorDocuments.uid,
        sponsorDocuments: sponsorDocuments.documents,
        cmoDocumentsKeySSI: cmoDocumentsDsu.uid,
        cmoDocuments: cmoDocumentsDsu.documents,
        kitsSSI: kits.uid,
        kits: kits.kitIds,
        kitsFilename: kits.file.name,
        commentsKeySSI: comments.uid,
        comments: comments.comments,
      },
      order.uid
    );

    let notification = {
      operation: NotificationTypes.UpdateOrderStatus,
      orderId: orderModel.orderId,
      read: false,
      status: orderStatusesEnum.Initiated,
      keySSI: order.uid,
      role: Roles.Sponsor,
      did: '123-56',
      date: new Date().getTime(),
    };

    const resultNotification = await this.notificationsService.insertNotification(notification);
    console.log('notification:', resultNotification, this.notificationsService);

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

    this.sendMessageToEntity(
      CommunicationService.identities.CSC.SITE_IDENTITY,
      messagesEnum.StatusInitiated,
      {
        orderSSI: order.uid,
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
            sponsorDocuments: sponsorDocuments.documents,
            cmoDocumentsKeySSI: cmoDocuments.uid,
            cmoDocuments: cmoDocuments.documents,
            kitsSSI: kits.uid,
            kits: kits.kitIds,
            kitsFilename: kits.file.name,
            commentsKeySSI: comments.uid,
            comments: comments.comments,
          },
          order.uid
        );

        return orderDb;
      case Roles.Site:
        order = await this.mountEntityAsync(orderSSI, FoldersEnum.Orders);
        kits = await this.mountEntityAsync(attachedDSUKeySSIs.kitIdsKeySSI, FoldersEnum.Kits);
        comments = await this.mountEntityAsync(attachedDSUKeySSIs.commentsKeySSI, FoldersEnum.Comments);
        status = await this.mountEntityAsync(attachedDSUKeySSIs.statusKeySSI, FoldersEnum.Statuses);

        orderDb = await this.addOrderToDB(
          {
            ...order,
            orderSSI: order.uid,
            status: status.history,
            statusSSI: status.uid,
            kitsSSI: kits.uid,
            kits: kits.kitIds,
            kitsFilename: kits.file.name,
            commentsKeySSI: comments.uid,
            comments: comments.comments,
          },
          order.uid
        );

        return orderDb;
    }
  }

  // -> Function for reviewing, canceling, approving orders.

  async updateOrderNew(orderKeySSI, files, comment, role, newStatus) {
    let documents = null;
    let comments = null;

    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderKeySSI);

    const status = await this.updateStatusDsu(newStatus, orderDB.statusSSI);
    orderDB.status = status.history;

    if (files) {
      documents = await this.addDocumentsToDsu(files, role === Roles.CMO ? orderDB.cmoDocumentsKeySSI : orderDB.sponsorDocumentsKeySSI, role);
      if (role === Roles.CMO) {
        orderDB.cmoDocuments = documents.documents;
      } else {
        orderDB.sponsorDocuments = documents.documents;
      }
    }
    if (comment) {
      comments = await this.addCommentToDsu(comment, orderDB.commentsKeySSI);
      orderDB.comments = comments.comments;
    }
    const result = await this.updateOrderToDB(orderDB, orderKeySSI);

    let operation;
    switch (newStatus) {
      case orderStatusesEnum.ReviewedByCMO:
        operation = messagesEnum.StatusReviewedByCMO;
        break;
      case orderStatusesEnum.ReviewedBySponsor:
        operation = messagesEnum.StatusReviewedBySponsor;
        break;
      case orderStatusesEnum.Approved:
        operation = messagesEnum.StatusApproved;
        break;
      case orderStatusesEnum.Canceled:
        operation = messagesEnum.StatusCanceled;
        break;
    }

    this.communicationService.sendMessage(CommunicationService.identities.CSC.SITE_IDENTITY, {
      operation,
      data: {
        orderSSI: orderKeySSI,
      },
      shortDescription: 'Order Updated',
    });

    if (role === Roles.CMO) {
      this.communicationService.sendMessage(CommunicationService.identities.CSC.SPONSOR_IDENTITY, {
        operation,
        data: {
          orderSSI: orderKeySSI,
        },
        shortDescription: 'Order Updated',
      });
    } else {
      this.communicationService.sendMessage(CommunicationService.identities.CSC.CMO_IDENTITY, {
        operation,
        data: {
          orderSSI: orderKeySSI,
        },
        shortDescription: 'Order Updated',
      });
    }

    return result;
  }

  // -> Function for updating changed order locally

  async updateLocalOrder(orderKeySSI) {
    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderKeySSI);
    const status = await this.getEntityAsync(orderDB.statusSSI, FoldersEnum.Statuses);
    orderDB.status = status.history;

    const lastStatusUpdate = status.history.sort((a, b) => (moment(a.date).isSameOrAfter(moment(b.date)) ? -1 : 1))[0];

    switch (lastStatusUpdate.status) {
      case orderStatusesEnum.ReviewedByCMO:
        if (orderDB.cmoDocumentsKeySSI) {
          const cmoDocuments = await this.getEntityAsync(orderDB.cmoDocumentsKeySSI, FoldersEnum.Documents);
          orderDB.cmoDocuments = cmoDocuments.documents;
        }
        if (orderDB.commentsKeySSI) {
          const comments = await this.getEntityAsync(orderDB.commentsKeySSI, FoldersEnum.Comments);
          orderDB.comments = comments.comments;
        }
        break;
      case orderStatusesEnum.ReviewedBySponsor:
        if (orderDB.sponsorDocumentsKeySSI) {
          const sponsorDocuments = await this.getEntityAsync(orderDB.sponsorDocumentsKeySSI, FoldersEnum.Documents);
          orderDB.sponsorDocuments = sponsorDocuments.documents;
        }
        if (orderDB.commentsKeySSI) {
          const comments = await this.getEntityAsync(orderDB.commentsKeySSI, FoldersEnum.Comments);
          orderDB.comments = comments.comments;
        }
        break;
      case orderStatusesEnum.Approved:
        break;
      case orderStatusesEnum.Canceled:
        if (orderDB.commentsKeySSI) {
          const comments = await this.getEntityAsync(orderDB.commentsKeySSI, FoldersEnum.Comments);
          orderDB.comments = comments.comments;
        }
        break;
    }
    const result = await this.updateOrderToDB(orderDB, orderKeySSI);
    return result;
  }

  // -> Functions for accessing data

  async getOrderFromDsus(orderKeySSI) {
    const orderDB = await this.storageService.getRecord(this.ORDERS_TABLE, orderKeySSI);
    const status = await this.getEntityAsync(orderDB.statusSSI, FoldersEnum.Statuses);
    orderDB.status = status.history;

    const lastStatusUpdate = status.history.sort((a, b) => a - b)[0];

    switch (lastStatusUpdate.status) {
      case orderStatusesEnum.ReviewedByCMO:
        if (orderDB.cmoDocumentsKeySSI) {
          const cmoDocuments = await this.getEntityAsync(orderDB.cmoDocumentsKeySSI, FoldersEnum.Documents);
          orderDB.cmoDocuments = cmoDocuments;
        }
        if (orderDB.commentsKeySSI) {
          const comments = await this.getEntityAsync(orderDB.commentsKeySSI, FoldersEnum.Comments);
          orderDB.comments = comments;
        }
        break;
      case orderStatusesEnum.ReviewedBySponsor:
        if (orderDB.sponsorDocumentsKeySSI) {
          const sponsorDocuments = await this.getEntityAsync(orderDB.sponsorDocumentsKeySSI, FoldersEnum.Documents);
          orderDB.sponsorDocuments = sponsorDocuments;
        }
        if (orderDB.commentsKeySSI) {
          const comments = await this.getEntityAsync(orderDB.commentsKeySSI, FoldersEnum.Comments);
          orderDB.comments = comments;
        }
        break;
      case orderStatusesEnum.Approved:
        break;
      case orderStatusesEnum.Canceled:
        if (orderDB.commentsKeySSI) {
          const comments = await this.getEntityAsync(orderDB.commentsKeySSI, FoldersEnum.Comments);
          orderDB.comments = comments;
        }
        break;
    }
    return orderDB;
  }
}

module.exports = OrdersService;
