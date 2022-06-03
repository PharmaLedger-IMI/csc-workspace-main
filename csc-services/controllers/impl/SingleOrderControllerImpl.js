const AccordionController  = require("./helpers/AccordionController");
const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const FileDownloaderService = cscServices.FileDownloaderService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const statusesService = cscServices.StatusesService;
const { Roles, Topics, ButtonsEnum, Commons, FoldersEnum } = cscServices.constants;
const { orderStatusesEnum, orderPendingActionEnum } = cscServices.constants.order;
const { shipmentStatusesEnum } = cscServices.constants.shipment;
const KitsService = cscServices.KitsService;

class SingleOrderControllerImpl extends AccordionController {
  constructor(role, ...props) {
    super(...props);
    this.role = role;
    this.addedRefreshListeners = false;
    this.attachedSponsorEventsHandlers = false;
    this.attachedCMOEventsHandlers = false;

    const model = viewModelResolver('order');
    //all fields are disabled
    for (let prop in model.form.inputs) {
      model.form.inputs[prop].disabled = true;
    }
    this.model = model;

    let { uid } = this.history.location.state;
    this.model.uid = uid;

    this.initServices();

    this.openFirstAccordion();
    this.toggleAccordionItemHandler();

    this.onTagEvent('history-button', 'click', (e) => {
      this.onShowHistoryClick();
    });

    this.onTagClick('download-file', async (model, target, event) => {
      const filename = target.getAttribute('data-custom') || null;
      if (filename) {
        if (model.name && model.name === filename) {
          const keySSI = this.model.order.sponsorDocumentsKeySSI;
          await this.downloadFile(filename, FoldersEnum.Documents, keySSI);
        } else {
          await this.downloadFile(filename, FoldersEnum.KitIds, model.order.kitsSSI);
        }
      }
    });

    this.navigationHandlers();
   
  }

  async initServices(){
    this.FileDownloaderService = new FileDownloaderService();
    this.ordersService = new OrdersService();
    this.shipmentsService = new ShipmentsService();
    this.kitsService = new KitsService();
    this.init();

  }

  navigationHandlers() {
    this.onTagClick('nav-back', () => {
      this.history.goBack();
    });

    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Order });
    });
  }

  async onShowHistoryClick() {
    let { order, shipment } = this.model.toObject();
    const historyModel = {
      order: order,
      shipment: shipment,
      currentPage: Topics.Order
    };

    if (this.role === Roles.Sponsor) {
      try{
        historyModel.kits = await this.kitsService.getOrderKits(order.studyId, order.orderId);
      }
      catch (e){
        historyModel.kits = []
      }
    }

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
      centered: true
    });
  }

  async init() {
    this.model.order = await this.ordersService.getOrder(this.model.uid);
    this.model.order = { ...this.transformOrderData(this.model.order) };
    this.model.order.delivery_date = {
      date: this.getDate(this.model.order.deliveryDate),
      time: this.getTime(this.model.order.deliveryDate)
    };

    if (this.model.order.shipmentSSI) {
      const shipment = await this.shipmentsService.getShipment(this.model.order.shipmentSSI);
      this.model.shipment = this.transformShipmentData(shipment);
      if (this.model.shipment.status_value !== shipmentStatusesEnum.InPreparation) {
        this.model.order.pending_action = orderPendingActionEnum.NoFurtherActionsRequired;
      }
    }

    this.model.order.actions = this.setOrderActions();
    this.attachRefreshListeners();
    this.model.order.filesEmpty = (this.model.order.documents.length == 0);
  }

   attachRefreshListeners() {

     if (!this.addedRefreshListeners) {
       this.addedRefreshListeners = true;
       this.refreshModalOpened = false;

       // Here is a known semantic issue: when both shipment and order are canceled,
       // but from the business point of view the application is not presenting any bug because the order will refresh
       // and will prevent the shipment refresh to trigger

       eventBusService.addEventListener(Topics.RefreshOrders + this.model.order.orderId, this.showOrderUpdateModal.bind(this));
       if(this.model.shipment){
         eventBusService.addEventListener(Topics.RefreshShipments + this.model.shipment.shipmentId,  this.showOrderUpdateModal.bind(this));
       }
     }
  }

  showOrderUpdateModal() {
    if (!this.refreshModalOpened) {
      this.refreshModalOpened = true;
      let title = 'Order Updated';
      let content = 'Order was updated';
      let modalOptions = {
        disableExpanding: true,
        disableClosing: true,
        disableCancelButton: true,
        confirmButtonText: 'Update View',
        id: 'confirm-modal'
      };
      this.showModal(content, title, this.init.bind(this), this.init.bind(this), modalOptions);
    }
  }

  transformOrderData(data) {
    if (data) {
      data.documents = [];

      data.status_value = data.status.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      })[0].status;

      data.status_date = momentService(
        data.status.sort(function(a, b) {
          return new Date(b.date) - new Date(a.date);
        })[0].date
      ).format(Commons.DateTimeFormatPattern);

      const statuses = statusesService.getOrderStatuses();
      data.status_approved = statuses.approvedStatuses.includes(data.status_value);
      data.status_cancelled = statuses.canceledStatuses.includes(data.status_value);
      data.status_normal = statuses.normalStatuses.includes(data.status_value);
      data.pending_action = this.getPendingAction(data.status_value);

      if (data.comments) {
        data.comments.forEach((comment) => {
          comment.date = momentService(comment.date).format(Commons.DateTimeFormatPattern);
        });
      }

      if (data.sponsorDocuments) {
        data.sponsorDocuments.forEach((doc) => {
          doc.date = momentService(doc.date).format(Commons.DateTimeFormatPattern);
          data.documents.push(doc);
        });
      }

      return data;
    }

    return {};
  }

  transformShipmentData(shipment) {
    if (shipment) {
      shipment.status_value = shipment.status.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      })[0].status;

      return shipment;
    }

    return null;
  }

  getPendingAction(status_value) {
    switch (status_value) {
      case orderStatusesEnum.Initiated:
      case orderStatusesEnum.InProgress:
        return orderPendingActionEnum.PendingShipmentPreparation;

      case orderStatusesEnum.Canceled:
        return orderPendingActionEnum.NoPendingActions;

    }

    return '';
  }

  setOrderActions() {
    const order = this.model.order;
    const shipment = this.model.shipment;
    const isShipmentCreated = typeof shipment !== 'undefined';
    const cancellableOrderStatus = [orderStatusesEnum.Initiated, orderStatusesEnum.InProgress, shipmentStatusesEnum.InPreparation];
    const actions = {};

    switch (this.role) {
      case Roles.Sponsor:
        actions.canBeCancelled = cancellableOrderStatus.indexOf(order.status_value) !== -1 && (!shipment || cancellableOrderStatus.indexOf(shipment.status_value) !== -1);
        actions.orderCancelButtonText = isShipmentCreated ? ButtonsEnum.CancelOrderAndShipment : ButtonsEnum.CancelOrder;
        this.attachSponsorEventHandlers();
        break;

      case Roles.CMO:
        actions.canPrepareShipment = !isShipmentCreated && orderStatusesEnum.Initiated === order.status_value;
        this.attachCmoEventHandlers();
        break;
    }

    return actions;
  }

  attachSponsorEventHandlers() {
    if(this.attachedSponsorEventsHandlers){
      return;
    }

    this.onTagEvent('cancel-order', 'click', () => {
      this.model.cancelOrderModal = viewModelResolver('order').cancelOrderModal;
      this.showModalFromTemplate('cancelOrderModal', this.cancelOrder.bind(this), () => {
      }, {
          controller: 'CancelOrderController',
          disableExpanding: true,
          disableBackdropClosing: true,
          disableFooter: true,
          model: this.model
        });
    });

    this.attachedSponsorEventsHandlers = true;
  }

  async cancelOrder() {
    window.WebCardinal.loader.hidden = false;
    const { uid } = this.model.order;
    let comment = this.model.cancelOrderModal.comment.value ? {
      entity: this.role,
      comment: this.model.cancelOrderModal.comment.value,
      date: new Date().getTime()
    }
      : null;
    await this.ordersService.updateOrder(uid, comment, this.role, orderStatusesEnum.Canceled);
    const shipment = this.model.shipment;
    let orderLabel = 'Order';
    if (shipment) {
      orderLabel = 'Order and Shipment';
      await this.shipmentsService.updateShipment(shipment.uid, shipmentStatusesEnum.ShipmentCancelled);
      eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    }

    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    window.WebCardinal.loader.hidden = true;
    this.showErrorModalAndRedirect(orderLabel + ' was canceled, redirecting to dashboard...', orderLabel + ' Cancelled', {tag:'dashboard'}, 2000);
  }

  attachCmoEventHandlers() {

    if(this.attachedCMOEventsHandlers){
      return;
    }

    this.onTagEvent('prepare-shipment', 'click', async () => {
      window.WebCardinal.loader.hidden = false;
      const order = this.model.order;
      const shipmentResult = await this.shipmentsService.createShipment(order);

      const otherOrderDetails = {
        //store only the anchor id
        shipmentSSI: shipmentResult.uid
      };
      await this.ordersService.updateOrder(order.uid, null, Roles.CMO, orderStatusesEnum.InProgress, otherOrderDetails);
      eventBusService.emitEventListeners(Topics.RefreshOrders, null);
      eventBusService.emitEventListeners(Topics.RefreshShipments, null);
      window.WebCardinal.loader.hidden = true;
      this.createWebcModal({
        template: 'prepareShipmentModal',
        controller: 'PrepareShipmentModalController',
        model: { ...shipmentResult },
        disableBackdropClosing: false,
        disableFooter: true,
        disableHeader: true,
        disableExpanding: true,
        disableClosing: true,
        disableCancelButton: true,
        expanded: false,
        centered: true
      });
    });
    this.attachedCMOEventsHandlers = true;
  }



  getDate(timestamp) {
    return momentService(timestamp).format(Commons.DateFormatPattern);
  }

  getTime(timestamp) {
    return momentService(timestamp).format(Commons.HourFormatPattern);
  }

  async downloadFile(filename, rootFolder, keySSI) {
    window.WebCardinal.loader.hidden = false;
    const path = rootFolder + '/' + keySSI + '/' + 'files';
    await this.FileDownloaderService.prepareDownloadFromDsu(path, filename);
    this.FileDownloaderService.downloadFileToDevice(filename);
    window.WebCardinal.loader.hidden = true;
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('SingleOrderController', SingleOrderControllerImpl);
