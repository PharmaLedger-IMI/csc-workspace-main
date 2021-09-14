const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const FileDownloaderService = cscServices.FileDownloaderService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const { Roles, Commons, FoldersEnum, Topics } = cscServices.constants;
const { orderStatusesEnum } = cscServices.constants.order;
const { shipmentStatusesEnum, shipmentPendingActionEnum } = cscServices.constants.shipment;

const csIdentities = {};
csIdentities [Roles.Sponsor] = CommunicationService.identities.CSC.SPONSOR_IDENTITY;
csIdentities [Roles.CMO] = CommunicationService.identities.CSC.CMO_IDENTITY;
csIdentities [Roles.Site] = CommunicationService.identities.CSC.SITE_IDENTITY;
csIdentities [Roles.Courier] = CommunicationService.identities.CSC.COU_IDENTITY;

class SingleShipmentControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);

    this.role = role;

    let communicationService = CommunicationService.getInstance(csIdentities[role]);
    this.notificationsService = new NotificationsService(this.DSUStorage);
    this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);
    this.ordersService = new OrdersService(this.DSUStorage, communicationService);
    this.shipmentsService = new ShipmentsService(this.DSUStorage, communicationService);

    this.initViewModel();
    this.attachEventListeners();
    this.openFirstAccordion();
  }

  attachEventListeners() {
    this.showHistoryHandler();
    this.downloadKitListHandler();
    this.toggleAccordionItemHandler();

    this.editShipmentHandler();
    this.cancelOrderHandler();
    this.navigationHandlers();
  }

  navigationHandlers() {
    this.onTagClick('nav-back', () => {
      this.history.goBack();
    });

    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Shipment });
    });
  }

  toggleAccordionItemHandler() {
    this.onTagEvent('toggle-accordion', 'click', (model, target) => {
      const targetIcon = target.querySelector('.accordion-icon');
      target.classList.toggle('accordion-item-active');
      targetIcon.classList.toggle('rotate-icon');

      const panel = target.nextElementSibling;
      if (panel.style.maxHeight === '1000px') {
        panel.style.maxHeight = '0px';
      } else {
        panel.style.maxHeight = '1000px';
      }
    });
  }

  openFirstAccordion() {
    const accordion = this.querySelector('.accordion-item');
    const targetIcon = accordion.querySelector('.accordion-icon');
    const panel = accordion.nextElementSibling;

    accordion.classList.toggle('accordion-item-active');
    targetIcon.classList.toggle('rotate-icon');
    panel.style.maxHeight = '1000px';
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
    const result = await this.shipmentsService.updateShipment(this.model.keySSI, shipmentStatusesEnum.ReadyForDispatch, shipmentDetails);
    this.showErrorModalAndRedirect('Shipment was edited, redirecting to dashboard...', 'Shipment Edited', '/', 2000);
  };

  downloadKitListHandler() {
    this.onTagClick('download-kits-file', async (model) => {
      window.WebCardinal.loader.hidden = false;
      const fileName = model.order.kitsFilename;
      const path = FoldersEnum.Kits + '/' + model.order.kitsSSI + '/' + 'files';
      await this.FileDownloaderService.prepareDownloadFromDsu(path, fileName);
      this.FileDownloaderService.downloadFileToDevice(fileName);
      window.WebCardinal.loader.hidden = true;
    });
  }

  showHistoryHandler() {
    this.onTagEvent('history-button', 'click', () => {
      this.onShowHistoryClick();
    });
  }

  onShowHistoryClick() {
    let { order, shipment } = this.model.toObject();
    const historyModel = {
      order: order,
      shipment: shipment,
      currentPage: Topics.Shipment
    };

    this.createWebcModal({
      template: 'historyModal',
      controller: 'HistoryModalController',
      model: historyModel,
      disableBackdropClosing: false,
      disableFooter: true,
      disableExpanding: true,
      disableClosing: false,
      disableCancelButton: true,
      expanded: false,
      centered: true,
    });
  }

  transformOrderData(data) {
    if (data) {
      data.delivery_date = this.getDateTime(data.deliveryDate);

      return data;
    }

    return {};
  }

  getDateTime(str) {
    const dateTime = str.split(' ');
    return {
      date: dateTime[0],
      time: dateTime[1]
    };
  }

  transformShipmentData(data) {
    if (data) {
      data.status_value = data.status.sort((function(a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].status;
      if (data.status_value === shipmentStatusesEnum.ShipmentCancelled) {
        data.status_value = shipmentStatusesEnum.Cancelled;
      }

      data.status_date = momentService(data.status.sort((function(a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].date).format(Commons.DateTimeFormatPattern);

      const normalStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch];
      const approvedStatuses = [shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered, shipmentStatusesEnum.Received];
      data.status_approved = approvedStatuses.indexOf(data.status_value) !== -1;
      data.status_cancelled = data.status_value === shipmentStatusesEnum.Cancelled;
      data.status_normal = normalStatuses.indexOf(data.status_value) !== -1;
      data.pending_action = this.getPendingAction(data.status_value);
      data.contextualContent = {
        afterReadyForDispatch: data.status.findIndex(el => el.status === shipmentStatusesEnum.ReadyForDispatch) !== -1,
        afterInTransit: data.status.findIndex(el => el.status === shipmentStatusesEnum.InTransit) !== -1,
        afterDelivered: data.status.findIndex(el => el.status === shipmentStatusesEnum.Delivered) !== -1,
        afterReceived: data.status.findIndex(el => el.status === shipmentStatusesEnum.Received) !== -1
      };

      return data;
    }

    return {};
  }

  getPendingAction(status_value) {
    switch (status_value) {
      case shipmentStatusesEnum.InPreparation:
        return shipmentPendingActionEnum.PendingReadyForDispatch;

      case shipmentStatusesEnum.ReadyForDispatch:
        return shipmentPendingActionEnum.PendingPickUp;

      case shipmentStatusesEnum.InTransit:
        return shipmentPendingActionEnum.PendingDelivery;

      case shipmentStatusesEnum.Delivered:
        return shipmentPendingActionEnum.PendingReception;

      case shipmentStatusesEnum.Received:
        return shipmentPendingActionEnum.ManageKits;
    }

    return '-';
  }

  setShipmentActions(shipment) {
    const actions = {};
    const cancelShipmentStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch];
    switch(this.role) {
      case Roles.Sponsor: {
        actions.canCancelOrderAndShipment = cancelShipmentStatuses.indexOf(shipment.status_value) !== -1;
        this.attachSponsorEventHandlers();

        break;
      }

    }

    // TODO: Update the logic according to statuses after #61 is completed
    actions.canScanShipment = false;
    actions.canEditShipment = true;

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
    const {keySSI} = this.model.order;
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

  async initViewModel() {
    const model = {
      orderModel: viewModelResolver('order'),
      shipmentModel: viewModelResolver('shipment')
    };
    //all fields are disabled
    for (let prop in model.orderModel.form.inputs) {
      model.orderModel.form.inputs[prop].disabled = true;
    }
    for (let prop in model.shipmentModel.form.inputs) {
      model.shipmentModel.form.inputs[prop].disabled = true;
    }

    let { keySSI } = this.history.location.state;
    model.keySSI = keySSI;

    model.shipmentModel.shipment = await this.shipmentsService.getShipment(model.keySSI);
    model.shipmentModel.shipment = { ...this.transformShipmentData(model.shipmentModel.shipment) };
    model.actions = this.setShipmentActions(model.shipmentModel);

    model.orderModel.order = await this.ordersService.getOrder(model.shipmentModel.shipment.orderSSI);
    model.orderModel.order = { ...this.transformOrderData(model.orderModel.order) };

    this.model = model;
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('SingleShipmentController', SingleShipmentControllerImpl);
