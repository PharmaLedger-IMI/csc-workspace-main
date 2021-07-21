const { WebcController } = WebCardinal.controllers;
const cscServices = require("csc-services");
const OrdersService  = cscServices.OrderService;
const viewModelResolver = cscServices.viewModelResolver;

export default class SingleOrderController extends WebcController {
  constructor(...props) {
    super(...props);

    this.model = viewModelResolver("order");

    let { id, keySSI, documentsKeySSI } = this.history.location.state;
    this.ordersService = new OrdersService(this.DSUStorage);

    this.model.id = id;
    this.model.keySSI = keySSI;
    this.model.documentsKeySSI = documentsKeySSI;

    this.attachEvents();

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

    this.onTagEvent('review-order','click',(e)=>{
        this.navigateToPageTag("review-order",{
            order: JSON.parse(JSON.stringify(this.model.order))
        })
    })
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
      this.closeAccordionItem('attached_documents_accordion');
      this.closeAccordionItem('order_comments_accordion');
    }

    if (el === 'attached_documents_accordion') {
      this.closeAccordionItem('order_details_accordion');
      this.closeAccordionItem('order_comments_accordion');
    }

    if (el === 'order_comments_accordion') {
      this.closeAccordionItem('attached_documents_accordion');
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
    const order = await this.ordersService.getOrder(this.model.keySSI, this.model.documentsKeySSI);
    this.model.order = order;
    console.log('MODEL:', JSON.stringify(this.model.order, null, 2));
    this.model.order.delivery_date = {
      date: this.getDate(this.model.order.deliveryDate),
      time: this.getTime(this.model.order.deliveryDate),
    };
    console.log('MODEL:', JSON.stringify(this.model.order, null, 2));

    this.loadDataToInputs(order);

    return;
  }

  loadDataToInputs(order) {
    const el = document.getElementById('sponsorId');
    console.log('Order', order);
    console.log('Element', el);

    if (order && el) {
      el.value = order.sponsorId;
    }
  }

  attachEvents() {
    return;
  }

  getDate(str) {
    return str.split(' ')[0];
  }

  getTime(str) {
    return str.split(' ')[1];
  }
}
