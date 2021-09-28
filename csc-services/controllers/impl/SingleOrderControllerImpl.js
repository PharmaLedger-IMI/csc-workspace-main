const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const FileDownloaderService = cscServices.FileDownloaderService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const { Roles, Topics, ButtonsEnum, Commons, FoldersEnum } = cscServices.constants;
const { orderStatusesEnum, orderPendingActionEnum } = cscServices.constants.order;
const { shipmentStatusesEnum } = cscServices.constants.shipment;

const csIdentities = {};
csIdentities[Roles.Sponsor] = CommunicationService.identities.CSC.SPONSOR_IDENTITY;
csIdentities[Roles.CMO] = CommunicationService.identities.CSC.CMO_IDENTITY;
csIdentities[Roles.Site] = CommunicationService.identities.CSC.SITE_IDENTITY;

class SingleOrderControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    this.role = role;

    const model = viewModelResolver('order');
    //all fields are disabled
    for (let prop in model.form.inputs) {
      model.form.inputs[prop].disabled = true;
    }
    this.model = model;

    let { keySSI } = this.history.location.state;
    this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);
    let communicationService = CommunicationService.getInstance(csIdentities[role]);
    this.ordersService = new OrdersService(this.DSUStorage, communicationService);
    this.shipmentsService = new ShipmentsService(this.DSUStorage, communicationService);

    this.model.keySSI = keySSI;

    this.init();

    //Init Check on Accordion Items
    if (this.model.accordion) {
      let keys = Object.keys(this.model.accordion);
      if (keys) {
        keys.forEach((key) => {
          if (this.model.accordion[key].isOpened) {
            this.openAccordionItem(this.model.accordion[key].id);
          }
        });
      }
    }

    this.onTagEvent('order_details_accordion', 'click', (e) => {
      this.toggleAccordionItem('order_details_accordion');
      this.model.accordion.order_details.isOpened = !this.model.accordion.order_details.isOpened;
    });

    this.onTagEvent('attached_documents_accordion', 'click', (e) => {
      this.toggleAccordionItem('attached_documents_accordion');
      this.model.accordion.attached_documents.isOpened = !this.model.accordion.attached_documents.isOpened;
    });

    this.onTagEvent('order_comments_accordion', 'click', (e) => {
      this.toggleAccordionItem('order_comments_accordion');
      this.model.accordion.order_comments.isOpened = !this.model.accordion.order_comments.isOpened;
    });

    this.onTagEvent('history-button', 'click', (e) => {
      this.onShowHistoryClick();
    });

    this.onTagClick('download-file', async (model, target, event) => {
      const filename = target.getAttribute('data-custom') || null;
      if (filename) {
        if (model.name && model.name === filename) {
          const document = this.model.order.documents.find((x) => x.name === filename);
          const keySSI = document.attached_by === Roles.Sponsor ? this.model.order.sponsorDocumentsKeySSI : this.model.order.cmoDocumentsKeySSI;
          await this.downloadFile(filename, FoldersEnum.Documents, keySSI);
        } else {
          await this.downloadFile(filename, FoldersEnum.Kits, model.order.kitsSSI);
        }
      }
    });

    this.onTagClick('download-kits-file', async (model, target, event) => {
      const filename = target.getAttribute('data-custom') || null;
      if (filename) {
        await this.downloadFile(filename, FoldersEnum.Kits, model.order.kitsSSI);
      }
    });

    this.navigationHandlers();
  }

  attachRefresh() {
		eventBusService.addEventListener(Topics.RefreshOrders, async () => {
      let title = 'Order Updated';
      let content = 'Order was updated, New status is available';
			this.showOrderUpdateModal(title, content);
		});
    eventBusService.addEventListener(Topics.RefreshShipments, async () => {
      let title = 'Shipment Updated';
      let content = 'Shipment was updated, New status is available';
			this.showOrderUpdateModal(title, content);
		});
	}

  showOrderUpdateModal(title, content) {
    let modalOptions = {
      disableExpanding: true,
      confirmButtonText: 'Update View',
      id: 'confirm-modal'
    };

    this.showModal(content, title, this.init.bind(this), this.init.bind(this), modalOptions);
  }

  navigationHandlers() {
    this.onTagClick('nav-back', () => {
      this.history.goBack();
    });

    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Order });
    });
  }

  toggleAccordionItem(el) {
    const element = document.getElementById(el);

    const icon = document.getElementById(el + '_icon');
    element.classList.toggle('accordion-item-active');
    icon.classList.toggle('rotate-icon');

    const panel = element.nextElementSibling;

    if (panel.style.maxHeight === '1000px') {
      panel.style.maxHeight = '0px';
    } else {
      panel.style.maxHeight = '1000px';
    }
  }

  openAccordionItem(el) {
    const element = document.getElementById(el);
    const icon = document.getElementById(el + '_icon');

    element.classList.add('accordion-item-active');
    icon.classList.add('rotate-icon');

    const panel = element.nextElementSibling;
    panel.style.maxHeight = '1000px';

    this.closeAllExcept(el);
  }

  closeAccordionItem(el) {
    const element = document.getElementById(el);
    const icon = document.getElementById(el + '_icon');

    element.classList.remove('accordion-item-active');
    icon.classList.remove('rotate-icon');

    const panel = element.nextElementSibling;
    panel.style.maxHeight = '0px';
  }

  closeAllExcept(el) {

    if (el === 'order_details_accordion') {
      this.closeAccordionItem('order_comments_accordion');
    }

    if (el === 'order_comments_accordion') {
      this.closeAccordionItem('order_details_accordion');
    }
  }

  onShowHistoryClick() {
    let { order, shipment } = this.model.toObject();
    const historyModel = {
      order: order,
      shipment: shipment,
      currentPage: Topics.Order
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
      centered: true
    });
  }

  async init() {
    const order = await this.ordersService.getOrder(this.model.keySSI);
    this.model.order = order;
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
    this.attachRefresh();
  }

  transformOrderData(data) {
    if (data) {
      data.documents = [];

      if (data.sponsorDocuments) {
        data.sponsorDocuments.forEach((item) => {
          item.date = momentService(item.data).format(Commons.DateTimeFormatPattern);
        });
      }

      data.status_value = data.status.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      })[0].status;

      data.status_date = momentService(
        data.status.sort(function(a, b) {
          return new Date(b.date) - new Date(a.date);
        })[0].date
      ).format(Commons.DateTimeFormatPattern);

      data.status_approved = data.status_value === orderStatusesEnum.Approved;
      data.status_cancelled = data.status_value === orderStatusesEnum.Canceled;
      data.status_normal = data.status_value !== orderStatusesEnum.Canceled && data.status_value !== orderStatusesEnum.Approved;
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
      case orderStatusesEnum.ReviewedBySponsor:
        return orderPendingActionEnum.PendingReviewByCMO;

      case orderStatusesEnum.ReviewedByCMO:
        return orderPendingActionEnum.SponsorReviewOrApprove;

      case orderStatusesEnum.Canceled:
        return orderPendingActionEnum.NoPendingActions;

      case orderStatusesEnum.Approved:
        return orderPendingActionEnum.PendingShipmentPreparation;
    }

    return '';
  }

  setOrderActions() {
    const order = this.model.order;
    const shipment = this.model.shipment;
    const isShipmentCreated = typeof shipment !== 'undefined';
    const canCMOReviewStatuses = [orderStatusesEnum.Initiated, orderStatusesEnum.ReviewedBySponsor];
    const canSponsorReviewStatuses = [orderStatusesEnum.ReviewedByCMO];
    const cancellableOrderStatus = [orderStatusesEnum.Initiated, orderStatusesEnum.ReviewedByCMO, orderStatusesEnum.ReviewedBySponsor, orderStatusesEnum.Approved, shipmentStatusesEnum.InPreparation];
    const actions = {};

    switch (this.role) {
      case Roles.Sponsor:
        actions.canBeReviewed = canSponsorReviewStatuses.indexOf(order.status_value) !== -1;
        actions.canBeCancelled = cancellableOrderStatus.indexOf(order.status_value) !== -1 && (!shipment || cancellableOrderStatus.indexOf(shipment.status_value) !== -1);
        actions.canBeApproved = actions.canBeReviewed;
        actions.orderCancelButtonText = isShipmentCreated ? ButtonsEnum.CancelOrderAndShipment : ButtonsEnum.CancelOrder;
        this.attachSponsorEventHandlers();
        break;

      case Roles.CMO:
        actions.canPrepareShipment = !isShipmentCreated && orderStatusesEnum.Approved === order.status_value;
        actions.canBeReviewed = canCMOReviewStatuses.indexOf(order.status_value) !== -1;
        this.attachCmoEventHandlers();
        break;
    }

    return actions;
  }

  attachSponsorEventHandlers() {
    this.onTagEvent('review-order', 'click', () => {
      this.navigateToPageTag('review-order', {
        order: this.model.toObject('order')
      });
    });

    this.onTagEvent('cancel-order', 'click', () => {
      this.model.cancelOrderModal = viewModelResolver('order').cancelOrderModal;
      this.showModalFromTemplate('cancelOrderModal', this.cancelOrder.bind(this), () => {
      }, {
          controller: 'CancelOrderController',
          disableExpanding: true,
          disableBackdropClosing: true,
          model: this.model
        });
    });

    this.onTagEvent('approve-order', 'click', () => {
      let title = 'Approve Order';
      let content = 'Are you sure you want to approve the order?';
      let modalOptions = {
        disableExpanding: true,
        cancelButtonText: 'No',
        confirmButtonText: 'Yes',
        id: 'confirm-modal'
      };

      this.showModal(content, title, this.approveOrder.bind(this), () => {}, modalOptions);
    });
  }

  async cancelOrder() {
    const { keySSI } = this.model.order;
    let comment = this.model.cancelOrderModal.comment.value ? {
      entity: this.role,
      comment: this.model.cancelOrderModal.comment.value,
      date: new Date().getTime()
    }
      : null;
    await this.ordersService.updateOrderNew(keySSI, null, comment, this.role, orderStatusesEnum.Canceled);
    const shipment = this.model.shipment;
    let orderLabel = 'Order';
    if (shipment) {
      orderLabel = 'Order and Shipment';
      await this.shipmentsService.updateShipment(shipment.keySSI, shipmentStatusesEnum.ShipmentCancelled);
      eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    }

    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    this.showErrorModalAndRedirect(orderLabel + ' was canceled, redirecting to dashboard...', orderLabel + ' Cancelled', '/', 2000);
  }

  async approveOrder() {
    const {keySSI} = this.model.order;
    const result = await this.ordersService.updateOrderNew(keySSI, null, null, this.role, orderStatusesEnum.Approved);
    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    this.showErrorModalAndRedirect('Order was approved, redirecting to dashboard...', 'Order Approved', '/', 2000);
  }

  attachCmoEventHandlers() {
    this.onTagEvent('review-order', 'click', () => {
      this.navigateToPageTag('review-order', {
        order: this.model.toObject('order')
      });
    });

    this.onTagEvent('prepare-shipment', 'click', () => {
      this.showModal("Are you sure you want to prepare the shipment?",
        'Prepare Shipment',
        this.prepareShipment.bind(this),
        () => {
        }, {
          disableExpanding: true,
          cancelButtonText: 'No',
          confirmButtonText: 'Yes',
          id: 'confirm-modal'
        });
    });
  }

  async prepareShipment() {
    const order = this.model.order;
    const shipmentResult = await this.shipmentsService.createShipment(order);
    
    const otherOrderDetails = {
      shipmentSSI: shipmentResult.keySSI
    };
    const orderResult = await this.ordersService.updateOrderNew(order.keySSI, null, null, Roles.CMO, null, otherOrderDetails);

    eventBusService.emitEventListeners(Topics.RefreshOrders, null);
    eventBusService.emitEventListeners(Topics.RefreshShipments, null);
    this.showErrorModalAndRedirect('Shipment Initiated, redirecting to View Shipment page...', 'Shipment Initiated', { tag: 'shipment', state: { keySSI: shipmentResult.keySSI }}, 2000);
  };

  getDate(str) {
    return str.split(' ')[0];
  }

  getTime(str) {
    return str.split(' ')[1];
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
