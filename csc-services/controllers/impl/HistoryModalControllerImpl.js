// MyModalController.js
const { WebcController } = WebCardinal.controllers;

//Services
const cscServices = require('csc-services');

//Import
const momentService  = cscServices.momentService;

const {orderStatusesEnum} = cscServices.constants.order;

class HistoryModalControllerImpl extends WebcController {

    constructor(role,...props) {
        super(...props);

        this.controllerElement = props[0];

        this.model.order = {...this.transformData(this.model.order)}
    }

    onReady() {
        this.controllerElement.shadowRoot.querySelector(".webc-modal-dialog").style.maxWidth = "1000px";
    }

    transformData(data){
        if(data){
            if(data.status){

                data.status = [...data.status.sort( (function(a,b){
                    return new Date(a.date) - new Date(b.date);
                }))];

                data.status.forEach((item) => {
                    item.approved = item.status === orderStatusesEnum.Approved;
                    item.cancelled = item.status === orderStatusesEnum.Canceled;
                    item.normal = item.status !== orderStatusesEnum.Canceled && item.status !== orderStatusesEnum.Approved;
                    item.date = momentService(item.date).format('MM/DD/YYYY HH:mm:ss');
                })

            }

            return data;
        }
    }

}


const controllersRegistry = require("../ControllersRegistry").getControllersRegistry();
controllersRegistry.registerController("HistoryModalController", HistoryModalControllerImpl);
