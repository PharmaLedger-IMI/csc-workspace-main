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
          placeholder: "Enter elaboration"
        }
      }
    }

    this.shipmentService = new ShipmentService (this.DSUStorage);

    this.initHandlers();
  }


  initHandlers() {
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