// MyModalController.js
const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const momentService  = cscServices.momentService;
class HistoryModalController extends WebcController {

    constructor(...props) {
        super(...props);

        this.controllerElement = props[0];

        this.model.order = {...this.transformData(this.model.order)}
        debugger;
        console.log(this.model);
    }

    onReady() {
        let modal =  this.controllerElement.shadowRoot.querySelector(".webc-modal-dialog").style.maxWidth = "1000px";
        console.log(modal);
    }

    transformData(data){
        if(data){
            if(data.status){
                data.status.forEach((item) => {
                    item.date = momentService(item.date).format('MM/DD/YYYY HH:mm:ss');
                })
            }

            return data;
        }
    }

}



export default HistoryModalController;
