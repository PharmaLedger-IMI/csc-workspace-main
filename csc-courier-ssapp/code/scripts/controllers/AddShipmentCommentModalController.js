// MyModalController.js
const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const ShipmentService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics } = cscServices.constants;


class AddShipmentCommentModalController extends WebcController {

  constructor(...props) {
    super(...props);
    this.element = props[0];

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
    this.onTagEvent('submit-shipment-comment', 'click', (e) => {
      this.submit();
    });
  }


  async submit(){
    
    let payload = {
      date: new Date().getTime(),
      entity: Roles.Courier,
      comment: this.model.form.inputs.comment.value
    };
    
    await this.shipmentService.addShipmentComment( this.model.shipmentModel.shipment.shipmentSSI, payload);
    eventBusService.emitEventListeners(Topics.RefreshShipments + this.model.shipmentModel.shipment.shipmentId, null); 
    this.element.destroy();
  }

  hideModal(){
    this.element.querySelectorAll('webc-modal').forEach(modal => modal.remove());
  }
}

export default AddShipmentCommentModalController;
