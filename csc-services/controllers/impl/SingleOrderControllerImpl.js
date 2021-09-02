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
const { Roles, Topics, NotificationTypes, ButtonsEnum, Commons, FoldersEnum } = cscServices.constants;
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
    this.notificationsService = new NotificationsService(this.DSUStorage);
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
    const element = document.getElementById(el);

    if (el === 'order_details_accordion') {
      this.closeAccordionItem('order_comments_accordion');
    }

    if (el === 'order_comments_accordion') {
      this.closeAccordionItem('order_details_accordion');
    }
  }

  onShowHistoryClick() {
    this.createWebcModal({
      template: 'historyModal',
      controller: 'HistoryModalController',
      model: { order: this.model.order },
      disableBackdropClosing: false,
      disableFooter: true,
      disableHeader: true,
      disableExpanding: true,
      disableClosing: false,
      disableCancelButton: true,
      expanded: false,
      centered: true,
    });

    console.log('Show History Clicked');
  }

  async init() {
    const order = await this.ordersService.getOrder(this.model.keySSI);
    this.model.order = order;
    this.model.order = { ...this.transformData(this.model.order) };

    this.model.order.delivery_date = {
      date: this.getDate(this.model.order.deliveryDate),
      time: this.getTime(this.model.order.deliveryDate),
    };

    this.model.order.actions = this.setOrderActions();
  }

  transformData(data) {
    if (data) {
      data.documents = [];

      if (data.sponsorDocuments) {
        data.sponsorDocuments.forEach((item) => {
          item.date = momentService(item.data).format(Commons.DateTimeFormatPattern);
        });
      }

      data.status_value = data.status.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      })[0].status;

      data.status_date = momentService(
        data.status.sort(function (a, b) {
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
  }

  getPendingAction(status_value) {
    switch (status_value) {
      case orderStatusesEnum.Initiated:
        return orderPendingActionEnum.PendingReviewByCMO;

      case orderStatusesEnum.ReviewedByCMO:
        return orderPendingActionEnum.SponsorReviewOrApprove;

      case orderStatusesEnum.ReviewedBySponsor:
        return orderPendingActionEnum.CMOReviewOrApprove;

      case orderStatusesEnum.Canceled:
        return orderPendingActionEnum.NoPendingActions;

      case orderStatusesEnum.Approved:
        return orderPendingActionEnum.PendingShipmentPreparation;
    }

    return '';
  }

  setOrderActions() {
    const actions = {};
    const cancellableOrderStatus = [orderStatusesEnum.Initiated, orderStatusesEnum.ReviewedByCMO, orderStatusesEnum.ReviewedBySponsor, orderStatusesEnum.Approved, orderStatusesEnum.InPreparation];
    const order = this.model.order;
    switch (this.role) {
      case Roles.Sponsor:
        actions.couldNotBeReviewed = orderStatusesEnum.ReviewedByCMO !== order.status_value;
        actions.couldNotBeCancelled = cancellableOrderStatus.indexOf(order.status_value) === -1;
        actions.couldNotBeApproved = order.status.map((status) => status.status).indexOf(orderStatusesEnum.ReviewedByCMO) === -1 || orderStatusesEnum.Canceled === order.status_value || orderStatusesEnum.Approved === order.status_value;
        actions.orderCancelButtonText = order.pending_action === orderPendingActionEnum.PendingShipmentDispatch ? ButtonsEnum.CancelOrderAndShipment : ButtonsEnum.CancelOrder;
        this.onTagEvent('review-order', 'click', (e) => {
          this.navigateToPageTag('review-order', {
            order: JSON.parse(JSON.stringify(this.model.order)),
          });
        });

        this.onTagEvent('cancel-order', 'click', (e) => {
          this.showErrorModal(new Error(`Are you sure you want to cancel this order?`), 'Cancel Order', cancelOrder, () => {}, {
            disableExpanding: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
            id: 'error-modal',
          });
        });

        this.onTagEvent('approve-order', 'click', () => {
          this.showErrorModal(new Error(`Are you sure you want to approve the order?`), 'Approve Order', approveOrder, () => {}, {
            disableExpanding: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
            id: 'error-modal',
          });
        });

        const cancelOrder = async () => {
          const result = await this.ordersService.updateOrderNew(this.model.order.keySSI, null, null, Roles.Sponsor, orderStatusesEnum.Canceled);
          const notification = {
            operation: NotificationTypes.UpdateOrderStatus,
            orderId: this.model.order.orderId,
            read: false,
            status: orderStatusesEnum.Canceled,
            keySSI: this.model.order.keySSI,
            role: Roles.Sponsor,
            did: order.sponsorId,
            date: new Date().toISOString(),
          };
          await this.notificationsService.insertNotification(notification);
          eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
          eventBusService.emitEventListeners(Topics.RefreshOrders, null);
          this.showErrorModalAndRedirect('Order was canceled, redirecting to dashboard...', 'Order Cancelled', '/', 2000);
        };

        const approveOrder = async () => {
          const result = await this.ordersService.updateOrderNew(this.model.order.keySSI, null, null, Roles.Sponsor, orderStatusesEnum.Approved);
          const notification = {
            operation: NotificationTypes.UpdateOrderStatus,
            orderId: this.model.order.orderId,
            read: false,
            status: orderStatusesEnum.Approved,
            keySSI: this.model.order.keySSI,
            role: Roles.Sponsor,
            did: order.sponsorId,
            date: new Date().toISOString(),
          };
          await this.notificationsService.insertNotification(notification);
          eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
          eventBusService.emitEventListeners(Topics.RefreshOrders, null);
          this.showErrorModalAndRedirect('Order was approved, redirecting to dashboard...', 'Order Approved', '/', 2000);
        };
        break;
      case Roles.CMO:
        actions.couldNotBeReviewed = [orderStatusesEnum.ReviewedByCMO, orderStatusesEnum.Approved, orderStatusesEnum.Canceled].indexOf(order.status_value) !== -1;
        this.onTagEvent('review-order', 'click', (e) => {
          this.navigateToPageTag('review-order', {
            order: JSON.parse(JSON.stringify(this.model.order)),
          });
        });
        this.onTagEvent('prepare-shipment', 'click', () => {
          this.showErrorModal(new Error(`Are you sure you want to prepare the shipment?`), 'Prepare Shipment', prepareShipment, () => {}, {
            disableExpanding: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
            id: 'error-modal',
          });
        });
        const prepareShipment = async () => {
          const result = await this.shipmentsService.createShipment(this.model.order);
          const notification = {
            operation: NotificationTypes.UpdateShipmentStatus,
            shipmentId: '1234',
            read: false,
            status: shipmentStatusesEnum.InPreparation,
            keySSI: result.keySSI,
            role: Roles.CMO,
            did: order.sponsorId,
            date: new Date().toISOString(),
          };
          await this.notificationsService.insertNotification(notification);
          eventBusService.emitEventListeners(Topics.RefreshNotifications, null);
          eventBusService.emitEventListeners(Topics.RefreshShipments, null);
          this.showErrorModalAndRedirect('Shipment Initiated, redirecting to dashboard...', 'Shipment Initiated', '/', 2000);
        };
        break;
    }
    return actions;
  }

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
