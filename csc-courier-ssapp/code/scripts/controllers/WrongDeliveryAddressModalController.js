const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const ShipmentService = cscServices.ShipmentService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics } = cscServices.constants;


class WrongDeliveryAddressModalController extends WebcController {

  constructor(...props) {
    super(...props);
    this.element = props[0];

    this.model.form = {
      inputs:{
        comment:{
          value: "",
          placeholder: "Enter elaboration",
          isEmpty:true
        }
      }
    }

    this.shipmentService = new ShipmentService ();

    this.model.onChange('form.inputs.comment.value', () => {
      this.model.form.inputs.comment.isEmpty = this.model.form.inputs.comment.value.trim() === '';
    });

    this.onTagEvent('submit-wrong-delivery-comment', 'click', (e) => {
      this.submit();
    });
  }


  async submit(){

    let payload = {
      date: new Date().getTime(),
      entity: Roles.Courier,
      comment: this.model.form.inputs.comment.value
    };

    await this.shipmentService.reportWrongDeliveryAddress( this.model.shipmentModel.shipment.uid, payload);
    eventBusService.emitEventListeners(Topics.RefreshShipments + this.model.shipmentModel.shipment.shipmentId, null);
    this.element.destroy();
  }

  hideModal(){
    this.element.querySelectorAll('webc-modal').forEach(modal => modal.remove());
  }
}

export default WrongDeliveryAddressModalController;