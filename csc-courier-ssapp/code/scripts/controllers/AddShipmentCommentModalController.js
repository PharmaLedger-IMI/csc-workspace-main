// MyModalController.js
const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const ShipmentService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const { shipment, Roles } = cscServices.constants;


class AddShipmentCommentModalController extends WebcController {

  constructor(...props) {
    super(...props);

    this.model.form = {
       inputs:{
         comment:{
           value: "",
           placeholder: "Type a comment for shipment"
         }
       }
    }

    let communicationService = CommunicationService.getInstance(Roles.Courier);
    this.shipmentService = new ShipmentService (this.DSUStorage, communicationService);

    this.initHandlers();
  }


  initHandlers() {
    this.onTagEvent('add-shipment-comment-submit-button', 'click', (e) => {
      this.submit();
    });
  }


  submit(){

    let payload = {
      date: new Date().getTime(),
      entity: Roles.Courier,
      comment: this.model.form.inputs.comment.value
    };

    console.log("Shipment SSI", this.model.shipmentModel.shipment.shipmentSSI);
    console.log("Payload:",payload);
    this.shipmentService.addShipmentComment( this.model.shipmentModel.shipment.shipmentSSI, payload);
    this.hideModal();
  }

  hideModal(){
    this.element.querySelectorAll('webc-modal').forEach(modal => modal.remove());
  }
}

export default AddShipmentCommentModalController;
