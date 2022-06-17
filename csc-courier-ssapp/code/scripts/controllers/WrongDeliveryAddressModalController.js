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
        },
        submitIsDisabled:true
      }
    }

    this.shipmentService = new ShipmentService ();

    this.model.onChange('form.inputs.comment.value', () => {
      this.model.submitIsDisabled = this.model.form.inputs.comment.value.trim() === '';
    });

    this.onTagEvent('submit-wrong-delivery-comment', 'click', (e) => {
      this.submit();
    });
  }


  async submit(){
    window.WebCardinal.loader.hidden = false;
    this.model.submitIsDisabled = true;

    let payload = {
      date: new Date().getTime(),
      entity: Roles.Courier,
      comment: this.model.form.inputs.comment.value
    };

    await this.shipmentService.reportWrongDeliveryAddress( this.model.shipmentModel.shipment.uid, payload);
    window.WebCardinal.loader.hidden = true;
    eventBusService.emitEventListeners(Topics.RefreshShipments + this.model.shipmentModel.shipment.shipmentId, null);
    this.element.destroy();
  }
}

export default WrongDeliveryAddressModalController;