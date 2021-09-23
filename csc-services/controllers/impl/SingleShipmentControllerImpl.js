const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const { Roles, Commons, Topics } = cscServices.constants;
const { orderStatusesEnum } = cscServices.constants.order;
const { shipmentStatusesEnum } = cscServices.constants.shipment;
const ViewShipmentBaseController  = require("./helpers/ViewShipmentBaseController");
const csIdentities = {};
csIdentities [Roles.Sponsor] = CommunicationService.identities.CSC.SPONSOR_IDENTITY;
csIdentities [Roles.CMO] = CommunicationService.identities.CSC.CMO_IDENTITY;
csIdentities [Roles.Site] = CommunicationService.identities.CSC.SITE_IDENTITY;
csIdentities [Roles.Courier] = CommunicationService.identities.CSC.COU_IDENTITY;

class SingleShipmentControllerImpl extends ViewShipmentBaseController{
  constructor(role, ...props) {
    super(...props);
    this.role = role;

    let communicationService = CommunicationService.getInstance(csIdentities[role]);
    this.notificationsService = new NotificationsService(this.DSUStorage);
    this.ordersService = new OrdersService(this.DSUStorage, communicationService);
    this.shipmentsService = new ShipmentsService(this.DSUStorage, communicationService);

    this.initViewModel();
    this.attachEventListeners();
    this.openFirstAccordion();
  }

  attachEventListeners() {
    this.showHistoryHandler();
    this.downloadKitListHandler();
    this.downloadAttachmentHandler();
    this.toggleAccordionItemHandler();

    this.editShipmentHandler();
    this.cancelOrderHandler();
    this.navigationHandlers();
  }


  editShipmentHandler() {
    this.onTagClick('edit-shipment', () => {
      const modalConfiguration = {
        controller: 'EditShipmentController',
        disableExpanding: true,
        disableBackdropClosing: false,
        disableFooter: true,
        model: { keySSI: this.model.keySSI }
      };

      this.showModalFromTemplate('editShipment', this.confirmEditShipmentCallback, () => {
      }, modalConfiguration);
    });
  }

  confirmEditShipmentCallback = async (event) => {
    const shipmentDetails = event.detail;
    await this.shipmentsService.updateShipment(this.model.keySSI, shipmentStatusesEnum.ReadyForDispatch, shipmentDetails);
    this.showErrorModalAndRedirect('Shipment was edited, redirecting to dashboard...', 'Shipment Edited', { tag: 'dashboard', state: { tab: Topics.Shipment }}, 2000);
  };

  transformOrderData(data) {
    if (data) {
      data.delivery_date = this.getDateTime(data.deliveryDate);

      data.documents = [];
      if (data.sponsorDocuments) {
        data.sponsorDocuments.forEach((doc) => {
          doc.date = momentService(doc.date).format(Commons.DateTimeFormatPattern);
          data.documents.push(doc);
        });
      }

      if (data.cmoDocuments) {
        data.cmoDocuments.forEach((doc) => {
          doc.date = momentService(doc.date).format(Commons.DateTimeFormatPattern);
          data.documents.push(doc);
        });
      }

      return data;
    }

    return {};
  }

  setShipmentActions(shipment) {
    const actions = {};
    switch(this.role) {
      case Roles.Sponsor: {
        actions.canCancelOrderAndShipment = (shipment.status_value === shipmentStatusesEnum.InPreparation);
        this.attachSponsorEventHandlers();

        break;
      }

      case Roles.CMO: {
        actions.canScanShipment = shipment.status_value === shipmentStatusesEnum.InPreparation && !shipment.isShipmentScanSuccessful;
        actions.canEditShipment = shipment.status_value === shipmentStatusesEnum.InPreparation && shipment.isShipmentScanSuccessful === true;

        this.attachCmoEventHandlers();
        break;
      }
    }

    return actions;
  }

  attachSponsorEventHandlers() {
    this.cancelOrderHandler();
  }

  cancelOrderHandler() {
    this.onTagEvent('cancel-order-shipment', 'click', () => {
      this.model.cancelOrderModal = viewModelResolver('order').cancelOrderModal;
      this.showModalFromTemplate('cancelOrderModal', this.cancelOrder.bind(this), () => {
      }, {
        controller: 'CancelOrderController',
        disableExpanding: true,
        disableBackdropClosing: true,
        model: this.model
      });
    });
  }

  async cancelOrder() {
    const keySSI = this.model.shipmentModel.shipment.orderSSI;
    let comment = this.model.cancelOrderModal.comment.value ? {
          entity: this.role,
          comment: this.model.cancelOrderModal.comment.value,
          date: new Date().getTime()
        }
        : null;
    await this.ordersService.updateOrderNew(keySSI, null, comment, this.role, orderStatusesEnum.Canceled);
    await this.shipmentsService.updateShipment(this.model.keySSI, shipmentStatusesEnum.ShipmentCancelled);

    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    this.showErrorModalAndRedirect('Order and Shipment were canceled, redirecting to dashboard...', 'Order and Shipment Cancelled', '/', 2000);
  }

  attachCmoEventHandlers(){
    this.scanShipmentHandler();
  }

  scanShipmentHandler() {
    this.onTagClick('scan-shipment', () => {
      const modalConfiguration = {
        controller: 'ScanShipmentModalController',
        disableExpanding: true,
        disableBackdropClosing: false,
        disableFooter: true,
        model: {
          shipmentId: this.model.orderModel.order.orderId,
          ...this.model.toObject('orderModel.order')
        }
      };

      this.showModalFromTemplate('scanShipmentModal', this.confirmScanShipmentCallback, () => {
      }, modalConfiguration);
    });
  }

  confirmScanShipmentCallback = async () => {
    this.model.shipmentModel.shipment.isShipmentScanSuccessful = true;
    this.model.actions.canEditShipment = true;
    this.model.actions.canScanShipment = false;

    const newShipmentData = {isShipmentScanSuccessful: true};
    const result = await this.shipmentsService.updateLocalShipment(this.model.keySSI, newShipmentData);
  };

  async initViewModel() {
    const model = {
      orderModel: viewModelResolver('order'),
      shipmentModel: viewModelResolver('shipment')
    };

    let { keySSI } = this.history.location.state;
    model.keySSI = keySSI;

    model.shipmentModel.shipment = await this.shipmentsService.getShipment(model.keySSI);
    model.shipmentModel.shipment = { ...this.transformShipmentData(model.shipmentModel.shipment) };
    model.actions = this.setShipmentActions(model.shipmentModel.shipment);

    model.orderModel.order = await this.ordersService.getOrder(model.shipmentModel.shipment.orderSSI);
    model.orderModel.order = { ...this.transformOrderData(model.orderModel.order) };

    model.documents = [];
    if (model.orderModel.order.documents) {
      model.documents = model.documents.concat(model.orderModel.order.documents);
    }
    if (model.shipmentModel.shipment.documents) {
      model.documents = model.documents.concat(model.shipmentModel.shipment.documents);
    }

    this.model = model;
    this.attachRefresh();
  }

  attachRefresh() {
    console.log("attachRefresh");
		eventBusService.addEventListener(Topics.RefreshShipments, async () => {
      console.log("RefreshShipments");
			let title = 'Shipment Updated';
			let content = 'Shipment was updated, New status is available';
			let modalOptions = {
				disableExpanding: true,
				confirmButtonText: 'Update View',
				id: 'confirm-modal'
			};

      this.showModal(content, title, this.initViewModel.bind(this), this.initViewModel.bind(this), modalOptions);
		});
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('SingleShipmentController', SingleShipmentControllerImpl);
