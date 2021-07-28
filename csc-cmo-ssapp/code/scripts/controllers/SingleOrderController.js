const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService  = cscServices.momentService;
const {orderStatusesEnum} = cscServices.constants.order;

export default class SingleOrderController extends WebcController {
    constructor(...props) {
        super(...props);
        const model = viewModelResolver('order');
        //all fields are disabled
        for (let prop in model.form.inputs) {
            model.form.inputs[prop].disabled = true;
        }
        this.model = model;

        let { id, keySSI } = this.history.location.state;
        this.ordersService = new OrdersService(this.DSUStorage);

        this.model.id = id;
        this.model.keySSI = keySSI;

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

        this.onTagEvent('review-order', 'click', (e) => {
            this.navigateToPageTag('review-order', {
                order: JSON.parse(JSON.stringify(this.model.order)),
            });
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
        const order = await this.ordersService.getOrder(this.model.keySSI);
        this.model.order = order;
        this.model.order = {...this.transformData(this.model.order)};
        this.model.order.delivery_date = {
            date: this.getDate(this.model.order.deliveryDate),
            time: this.getTime(this.model.order.deliveryDate),
        };
        console.log('MODEL:', JSON.stringify(this.model.order, null, 2));
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
                data.pending_action = "There are no any further pending actions.";
            }

            data.status_date = momentService(data.status.sort( (function(a,b){
                return new Date(b.date) - new Date(a.date);
            }))[0].date).format('MM/DD/YYYY HH:mm:ss');

            if(data.comments){
                data.comments.forEach( (comment) => {
                    comment.date = momentService(comment.date).format('MM/DD/YYYY HH:mm:ss');
                })
            }

            if(data.sponsorDocuments){
                data.sponsorDocuments.forEach( (doc) => {
                    doc.date = momentService(doc.date).format('MM/DD/YYYY HH:mm:ss');
                    data.documents.push(doc);
                })
            }

            if(data.cmoDocuments){
                data.cmoDocuments.forEach( (doc) => {
                    doc.date = momentService(doc.date).format('MM/DD/YYYY HH:mm:ss');
                    data.documents.push(doc);
                })
            }

            data.couldNotBeReviewed = [orderStatusesEnum.ReviewedByCMO, orderStatusesEnum.Approved, orderStatusesEnum.Canceled].indexOf(data.status_value)!==-1;

            return data;
        }
    }

    attachEvents() {
    }

    getDate(str) {
        return str.split(' ')[0];
    }

    getTime(str) {
        return str.split(' ')[1];
    }
}
