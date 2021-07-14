// MyModalController.js
const { WebcController } = WebCardinal.controllers;

class HistoryModalController extends WebcController {

    constructor(...props) {
        super(...props);

        this.controllerElement = props[0];

        console.log(this.model);
    }

    onReady() {
        let modal =  this.controllerElement.shadowRoot.querySelector(".webc-modal-dialog").style.maxWidth = "1000px";
        console.log(modal);
    }

}



export default HistoryModalController;
