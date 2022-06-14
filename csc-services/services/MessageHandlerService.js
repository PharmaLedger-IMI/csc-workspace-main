const {getCommunicationServiceInstance} = require("./lib/CommunicationService");
const OrdersService = require("./OrdersService");
const ShipmentsService = require("./ShipmentsService");
const KitsService = require("./KitsService");
const NotificationsService = require("./lib/NotificationService");
const eventBusService = require("./lib/EventBusService");
const { order, shipment, Roles, Topics, kit, notifications } = require("./constants");
const { NotificationTypes } = notifications;
const { orderStatusesEnum } = order;
const { shipmentStatusesEnum,shipmentsEventsEnum} = shipment;
const { kitsMessagesEnum, kitsStatusesEnum } = kit;

class MessageHandlerService {

  constructor(role,messageInProgress,messageCompleted, errorCallback) {
    this.role = role;
    this.messageInProgress = messageInProgress;
    this.messageCompleted = messageCompleted;
    this.errorCallback = errorCallback;
    this.ordersService = new OrdersService();
    this.shipmentService = new ShipmentsService();
    this.notificationsService = new NotificationsService();
    this.kitsService = new KitsService();
    this.communicationService = getCommunicationServiceInstance();


    this.ordersService.onReady(() => {
      this.shipmentService.onReady(() => {
        this.communicationService.listenForMessages(async (err, data) => {

          if (err) {
            return this.errorCallback(err);
          }

          //TODO refactor handling messages
          console.log('message received', data);

          switch (this.role) {
            case Roles.Courier:
              await this.handleShipmentMessages(data);
              break;
            default:
              await this.handleOrderMessages(data);
              await this.handleShipmentMessages(data);
              await this.handleKitsMessages(data);
          }

        });
      });
    });
  }


  async handleOrderMessages(data) {
    data = JSON.parse(data);
    const [orderData, orderStatus, notificationRole] = await this.processOrderMessage(data);
    if (!orderData || !orderStatus || !notificationRole) {
      return;
    }

    const notification = {
      operation: NotificationTypes.UpdateOrderStatus,
      orderId: orderData.orderId,
      read: false,
      status: orderStatus,
      uid: orderData.uid,
      role: notificationRole,
      did: data.senderIdentity,
      date: new Date().getTime()
    };

    await this.notificationsService.insertNotification(notification);
    eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    eventBusService.emitEventListeners(Topics.RefreshOrders + orderData.orderId, null);
  }

  async handleShipmentMessages(data) {
    data = JSON.parse(data);

    const [shipmentData, shipmentStatus, notificationRole] = await this.processShipmentMessage(data);
    if (!shipmentData || !shipmentStatus || !notificationRole) {
      return;
    }


    const notification = {
      operation: NotificationTypes.UpdateShipmentStatus,
      shipmentId: shipmentData.shipmentId,
      read: false,
      status: shipmentStatus,
      uid: shipmentData.uid,
      role: notificationRole,
      did: data.senderIdentity,
      date: new Date().getTime()
    };

    await this.notificationsService.insertNotification(notification);
    eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
    eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    eventBusService.emitEventListeners(Topics.RefreshShipments + shipmentData.shipmentId, null);

    //shipment statuses InPreparation and Received will trigger an order status change (In Progress and Completed)
    if ([shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.Received].indexOf(shipmentStatus)!==-1) {
      eventBusService.emitEventListeners(Topics.RefreshOrders + shipmentData.orderId, null);
    }

    //TODO: refactor this logic
    //added for the case when shipment is receiving a new shipmentId but the listeners are already using the initial shipmentId (which is orderId by convention)
    if (shipmentStatus === shipmentStatusesEnum.Dispatched || shipmentStatus === shipmentStatusesEnum.PickUpAtWarehouse && this.role === Roles.Sponsor) {
      eventBusService.emitEventListeners(Topics.RefreshShipments + shipmentData.orderId, null);
    }

  }

  async handleKitsMessages(data) {
    data = JSON.parse(data);
    const [kitsData, notificationRole] = await this.processKitsMessage(data);
    if (!kitsData || !notificationRole) {
      return;
    }
    eventBusService.emitEventListeners(Topics.RefreshKits, null);
  }

  async processOrderMessage(data) {
    let orderData;
    let orderStatus = data.operation;
    let notificationRole;

    switch (orderStatus) {
      case orderStatusesEnum.Initiated: {
        notificationRole = Roles.Sponsor;

        const {
          orderSSI,
          kitIdsKeySSI,
          statusKeySSI
        } = data.data;
        orderData = await this.ordersService.mountAndReceiveOrder(orderSSI, this.role,
          { kitIdsKeySSI, statusKeySSI });

        break;
      }
      case orderStatusesEnum.Canceled:
      case orderStatusesEnum.Completed:{
        notificationRole = Roles.Sponsor;
        orderData = await this.ordersService.updateLocalOrder(data.data.orderSSI);
        break;
      }

    }

    return [orderData, orderStatus, notificationRole];
  }

  async processShipmentMessage(data) {
    let shipmentData;
    let shipmentStatus = data.operation;
    let notificationRole;

    switch (shipmentStatus) {
      case shipmentStatusesEnum.InPreparation: {
        notificationRole = Roles.CMO;

        const { shipmentSSI, statusSSI } = data.data;

        shipmentData = await this.shipmentService.mountAndReceiveShipment(shipmentSSI, this.role, statusSSI);
        await this.ordersService.updateLocalOrder(shipmentData.orderSSI, { shipmentSSI: shipmentData.uid });
        break;
      }

      case shipmentStatusesEnum.ReadyForDispatch: {
        notificationRole = Roles.CMO;

        const { shipmentSSI, statusSSI } = data.data;
        switch (this.role) {
          case Roles.Courier:
            shipmentData = await this.shipmentService.mountAndReceiveShipment(shipmentSSI, this.role, statusSSI);
            break;
          default:
            shipmentData = await this.shipmentService.updateLocalShipment(shipmentSSI);
        }
        break;
      }

      case shipmentStatusesEnum.ShipmentCancelled: {
        notificationRole = Roles.Sponsor;

        const { shipmentSSI } = data.data;
        shipmentData = await this.shipmentService.updateLocalShipment(shipmentSSI);
        break;
      }

      case shipmentStatusesEnum.Dispatched:
      case shipmentStatusesEnum.PickUpAtWarehouse:
      case shipmentStatusesEnum.InTransit: {

        notificationRole = Roles.Courier;
        const messageData = data.data;
        const { shipmentSSI } = messageData;
        //SITE will receive on InTransit status all the details except shipmentBilling
        if (messageData.transitShipmentSSI) {
          shipmentData = { ...await this.shipmentService.mountAndReceiveTransitShipment(shipmentSSI, messageData.transitShipmentSSI, messageData.statusSSI, this.role) };
        }
        if (messageData.shipmentBilling) {
          shipmentData = { ...shipmentData, ...await this.shipmentService.mountShipmentBillingDSU(shipmentSSI, messageData.shipmentBilling)}
        }
        if (messageData.shipmentDocuments) {
          shipmentData = { ...shipmentData, ...await this.shipmentService.mountShipmentDocumentsDSU(shipmentSSI,messageData.shipmentDocuments) };
        }
        if (messageData.shipmentComments) {
          shipmentData = { ...shipmentData, ...await this.shipmentService.mountShipmentCommentsDSU(shipmentSSI,messageData.shipmentComments) };
        }
        break;
      }
      case shipmentStatusesEnum.Delivered: {
        notificationRole = Roles.Courier;
        const messageData = data.data;
        const { shipmentSSI } = messageData;
        shipmentData = await this.shipmentService.updateShipmentDB(shipmentSSI);
        break;
      }
      case shipmentStatusesEnum.Received: {
        notificationRole = Roles.Site;
        const messageData = data.data;
        const { receivedShipmentSSI, shipmentSSI } = messageData;
        shipmentData = await this.shipmentService.mountShipmentReceivedDSU(shipmentSSI, receivedShipmentSSI);
        await this.ordersService.updateOrder(shipmentData.orderSSI,null, Roles.Sponsor, orderStatusesEnum.Completed, null);
        break;
      }
      case shipmentStatusesEnum.ProofOfDelivery: {
        notificationRole = Roles.Site;
        const messageData = data.data;
        const { shipmentSSI } = messageData;
        shipmentData = await this.shipmentService.updateShipmentStatus(shipmentSSI, this.role);
        break;
      }
      case shipmentStatusesEnum.WrongDeliveryAddress: {
        notificationRole = Roles.Courier;
        const { shipmentSSI } = data.data;
        shipmentData = await this.shipmentService.updateLocalShipment(shipmentSSI);
        break;
      }
      case shipmentsEventsEnum.PickupDateTimeChangeRequest:{
        notificationRole = Roles.Courier;
        const { shipmentSSI, ...pickupDateTimeChangeRequest } = data.data;
        shipmentData = await this.shipmentService.storePickupDateTimeRequest(shipmentSSI, pickupDateTimeChangeRequest);
        break;
      }
      case shipmentsEventsEnum.PickupDateTimeChanged:{
        notificationRole = Roles.CMO;
        const { shipmentSSI } = data.data;
        shipmentData = await this.shipmentService.updateLocalShipment(shipmentSSI, { pickupDateTimeChangeRequest: undefined });
        break;
      }
    }

    return [shipmentData, shipmentStatus, notificationRole];
  }

  async processKitsMessage(data) {
    let kitsData;
    let kitsMessage = data.operation;
    let notificationRole = Roles.Site;
    switch (kitsMessage) {
      case kitsMessagesEnum.ShipmentSigned: {
        const { studyKeySSI } = data.data;
        kitsData = await this.kitsService.getStudyKitsDSUAndUpdate(studyKeySSI);

        //all kits will have the same orderId
        const orderId = kitsData.kits[0].orderId;
        const notification = {
          operation: NotificationTypes.UpdateKitStatus,
          studyId: kitsData.studyId,
          orderId: orderId,
          read: false,
          status: "Kits were received",
          uid: kitsData.uid,
          role: notificationRole,
          did: data.senderIdentity,
          date: new Date().getTime()
        };

        await this.notificationsService.insertNotification(notification);

        // Refresh Notifications
        eventBusService.emitEventListeners(Topics.RefreshNotifications, null);

        break;
      }
      case kitsMessagesEnum.KitRequestRelabeled:{

        if(this.role === Roles.Site) {
          // Site updates the status of the kit
          const { kitSSI, kitId } = data.data;
          kitsData = await this.kitsService.updateKit(kitSSI, kitsStatusesEnum.RequestRelabeling,{});

          const notification = {
            operation: NotificationTypes.UpdateKitStatus,
            studyId: kitsData.studyId,
            orderId: kitsData.kits[0].orderId,
            read: false,
            status: kitsStatusesEnum.RequestRelabeling,
            uid: kitsData.uid,
            role: Roles.Sponsor,
            did: data.senderIdentity,
            date: new Date().getTime()
          };

          await this.notificationsService.insertNotification(notification);

          // Refresh Notifications
          eventBusService.emitEventListeners(Topics.RefreshNotifications, null);

          // Site updates himself to refresh the kit
          eventBusService.emitEventListeners(Topics.RefreshKits + kitId, null);
        }

        break;
      }
      case kitsStatusesEnum.RequestRelabeling:{
        if(this.role === Roles.Sponsor) {
          const { kitSSI } = data.data;
          kitsData = await this.kitsService.updateStudyKitRecordKitSSI(kitSSI,kitsStatusesEnum.RequestRelabeling );

          // Sponsor get a message in order to update his kit id.
          eventBusService.emitEventListeners(Topics.RefreshKits + data.data.kitId, null);
        }
        break;
      }
      case kitsMessagesEnum.kitBlocked:{
        if(this.role === Roles.Sponsor) {
          const { kitSSI } = data.data;
          kitsData = await this.kitsService.updateStudyKitRecordKitSSI(kitSSI,kitsStatusesEnum.Blocked );

          const notification = {
            operation: NotificationTypes.UpdateKitStatus,
            studyId: kitsData.studyId,
            orderId: kitsData.kits[0].orderId,
            read: false,
            status: kitsStatusesEnum.Blocked,
            uid: kitsData.uid,
            role: Roles.Site,
            did: data.senderIdentity,
            date: new Date().getTime()
          };

          await this.notificationsService.insertNotification(notification);

          // Refresh Notifications
          eventBusService.emitEventListeners(Topics.RefreshNotifications, null);

          // Sponsor get a message in order to update his kit id.
          eventBusService.emitEventListeners(Topics.RefreshKits + data.data.kitId, null);
        }
        break;
      }
      case kitsMessagesEnum.MakeKitAvailable:{
        if(this.role === Roles.Sponsor) {

          const { kitSSI } = data.data;
          kitsData = await this.kitsService.updateStudyKitRecordKitSSI(kitSSI,kitsStatusesEnum.AvailableForAssignment );

          const notification = {
            operation: NotificationTypes.UpdateKitStatus,
            studyId: kitsData.studyId,
            orderId: kitsData.kits[0].orderId,
            read: false,
            status: kitsStatusesEnum.AvailableForAssignment,
            uid: kitsData.uid,
            role: Roles.Site,
            did: data.senderIdentity,
            date: new Date().getTime()
          };

          await this.notificationsService.insertNotification(notification);

          // Refresh Notifications
          eventBusService.emitEventListeners(Topics.RefreshNotifications, null);

          // Sponsor get a message in order to update his kit id.
          eventBusService.emitEventListeners(Topics.RefreshKits + data.data.kitId, null);
        }
        break;
      }
      case kitsStatusesEnum.AvailableForAssignment:
      case kitsStatusesEnum.Assigned:
      case kitsStatusesEnum.Dispensed:
      case kitsStatusesEnum.Returned:
      case kitsStatusesEnum.Reconciled:
      case kitsStatusesEnum.InQuarantine:
      case kitsStatusesEnum.PendingDestruction:
      case kitsStatusesEnum.Destroyed:{
        const { kitSSI } = data.data;
        kitsData = await this.kitsService.updateStudyKitRecordKitSSI(kitSSI, kitsMessage);
        break;
      }
    }
    return [kitsData, notificationRole];
  }



}

let instance = null;
const init = (role, messageInProgress,messageCompleted, errorCallback) => {
  if (instance === null) {
    instance = new MessageHandlerService(role, messageInProgress,messageCompleted, errorCallback);
  }

  return instance;
};


module.exports = {init};
