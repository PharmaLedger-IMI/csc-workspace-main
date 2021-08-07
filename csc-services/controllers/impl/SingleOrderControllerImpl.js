const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const CommunicationService = cscServices.CommunicationService;
const NotificationsService = cscServices.NotificationsService;
const eventBusService = cscServices.EventBusService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService  = cscServices.momentService;
const {Roles,Topics, NotificationTypes} = cscServices.constants;
const {orderStatusesEnum} = cscServices.constants.order;

const csIdentities  = {};
csIdentities [Roles.Sponsor] = CommunicationService.identities.CSC.SPONSOR_IDENTITY;
csIdentities [Roles.CMO] = CommunicationService.identities.CSC.CMO_IDENTITY;
csIdentities [Roles.Site] = CommunicationService.identities.CSC.SITE_IDENTITY;

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

    let {keySSI} = this.history.location.state;
    this.notificationsService = new NotificationsService(this.DSUStorage);
    let communicationService = CommunicationService.getInstance(csIdentities[role]);
    this.ordersService = new OrdersService(this.DSUStorage, communicationService);

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

    this.onTagEvent('download-kit-list', 'click', (e) => {
      console.log("[EVENT] download-kit-list");
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
    this.model.order = {...this.transformData(this.model.order)};

    this.model.order.delivery_date = {
      date: this.getDate(this.model.order.deliveryDate),
      time: this.getTime(this.model.order.deliveryDate)
    }

    this.model.order.actions = this.setOrderActions();
    console.log(this.model.order);
  }

  transformData(data){
    if(data){

      data.documents = [];

      if(data.sponsorDocuments){
        data.sponsorDocuments.forEach( (item) => {
          item.date = momentService(item.data).format('MM/DD/YYYY HH:mm:ss');

        });
      }

      data.status_value = data.status.sort( (function(a,b){
        return new Date(b.date) - new Date(a.date);
      }))[0].status

      data.status_date = momentService(data.status.sort( (function(a,b){
        return new Date(b.date) - new Date(a.date);
      }))[0].date).format('MM/DD/YYYY HH:mm:ss');

      data.status_approved = data.status_value === orderStatusesEnum.Approved;
      data.status_cancelled = data.status_value === orderStatusesEnum.Canceled;
      data.status_normal = data.status_value !== orderStatusesEnum.Canceled && data.status_value !== orderStatusesEnum.Approved;

      data.pending_action = "";

      if( data.status_value === orderStatusesEnum.ReviewedByCMO){
        data.pending_action = "Sponsor Review or Approve";
      }
      else if( data.status_value === orderStatusesEnum.ReviewedBySponsor){
        data.pending_action = "Cmo Review or Approve";
      }else{
        data.pending_action = "Pending Review by CMO";
      }

      if(data.comments){
        data.comments.forEach( (comment) => {
          comment.date = momentService(comment.date).format('MM/DD/YYYY HH:mm:ss');
        })
      }

      if (data.sponsorDocuments) {
        data.sponsorDocuments.forEach((doc) => {
          doc.date = momentService(doc.date).format('MM/DD/YYYY HH:mm:ss');
          data.documents.push(doc);
        });
      }

      if (data.cmoDocuments) {
        data.cmoDocuments.forEach((doc) => {
          doc.date = momentService(doc.date).format('MM/DD/YYYY HH:mm:ss');
          data.documents.push(doc);
        });
      }

      return data;
    }
  }

  setOrderActions(){
    const actions = {};
    const order = this.model.order;
    switch (this.role){
      case Roles.Sponsor:
        actions.couldNotBeReviewed = orderStatusesEnum.ReviewedByCMO !== order.status_value;
        actions.couldNotBeCancelled = orderStatusesEnum.Approved === order.status_value || orderStatusesEnum.Canceled === order.status_value;
        actions.couldNotBeApproved = order.status.map((status) => status.status).indexOf(orderStatusesEnum.ReviewedByCMO) === -1
            || orderStatusesEnum.Canceled === order.status_value || orderStatusesEnum.Approved === order.status_value;

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
        actions.couldNotBeReviewed = [orderStatusesEnum.ReviewedByCMO, orderStatusesEnum.Approved, orderStatusesEnum.Canceled].indexOf(order.status_value)!==-1;
        this.onTagEvent('review-order', 'click', (e) => {
          this.navigateToPageTag('review-order', {
            order: JSON.parse(JSON.stringify(this.model.order)),
          });
        });
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
}
const controllersRegistry = require("../ControllersRegistry").getControllersRegistry();
controllersRegistry.registerController("SingleOrderController", SingleOrderControllerImpl);