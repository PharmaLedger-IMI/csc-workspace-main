const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const {getCommunicationServiceInstance} = cscServices.CommunicationService;
const ProfileService = cscServices.ProfileService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const { shipment, notifications, Roles, Topics } = cscServices.constants;
const {NotificationTypes} = notifications;
const { shipmentStatusesEnum } = shipment;

class DashboardController extends WebcController {
  constructor(...props) {
    super(...props);

    this.role = Roles.Courier;

    this.model = {
      tabNavigator: {
        selected: '0'
      }
    };

    this.initServices()
    this.attachHandlers();
  }

  async initServices(){
    this.ordersService = new OrdersService(this.DSUStorage);
    this.shipmentService = new ShipmentsService(this.DSUStorage);
    this.profileService = ProfileService.getProfileServiceInstance();
    this.model.did = await this.profileService.getDID();
    const didData = ProfileService.getDidData(this.model.did);
    this.communicationService = getCommunicationServiceInstance(didData);
    this.notificationsService = new NotificationsService(this.DSUStorage, this.communicationService);
  }

  attachHandlers() {
    this.shipmentService.onReady(() => {
      this.handleMessages();
    });

    this.model.addExpression('isShipmentsSelected', () => this.model.tabNavigator.selected === '1', 'tabNavigator.selected');

    this.onTagClick('change-tab', async (model, target) => {
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.remove('active');
      this.model.tabNavigator.selected = target.getAttribute('data-custom');
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.add('active');
    });
  }

  handleMessages() {
    this.communicationService.listenForMessages(async (err, data) => {
      if (err) {
        return console.error(err);
      }
      this.handleShipmentMessages(data);
    });
  }


  async handleShipmentMessages(data) {
    data = JSON.parse(data);
    console.log('message received', data);
    const [shipmentData, shipmentStatus, notificationRole] = await this.processShipmentMessage(data);
    if (!shipmentData || !shipmentStatus || !notificationRole) {
      return;
    }

    console.log('shipment message received', shipmentData, shipmentStatus, notificationRole);
    const notification = {
      operation: NotificationTypes.UpdateShipmentStatus,
      shipmentId: shipmentData.shipmentId,
      read: false,
      status: shipmentStatus,
      keySSI: data.data.shipmentSSI,
      role: notificationRole,
      did: shipmentData.sponsorId,
      date: new Date().getTime()
    };

    const notificationResult = await this.notificationsService.insertNotification(notification);
    eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
    eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    console.log('notification added', notification, notificationResult);
  }


  async processShipmentMessage(data) {
    let shipmentData;
    let shipmentStatus;
    let notificationRole;

    switch (data.operation) {
      case shipmentStatusesEnum.ReadyForDispatch: {
        notificationRole = Roles.CMO;
        shipmentStatus = data.operation;

        const {
          shipmentSSI,
          statusSSI
        } = data.data;

        shipmentData = await this.shipmentService.mountAndReceiveShipment(shipmentSSI, this.role, statusSSI);
        break;
      }
      case shipmentStatusesEnum.ProofOfDelivery: {
      	notificationRole = Roles.Site;
      	shipmentStatus = data.operation;
      	const messageData = data.data;
      	const { shipmentSSI } = messageData;
        shipmentData = await this.shipmentService.updateShipmentStatus(shipmentSSI, this.role);
      	break;
      }
    }

    return [shipmentData, shipmentStatus, notificationRole];
  }
}
export default DashboardController;
