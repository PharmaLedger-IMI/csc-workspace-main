const { WebcController } = WebCardinal.controllers;

export default class DeliverShipmentController extends WebcController {

  constructor(...props) {
    super(...props);

    this.onEvents();
  }


  onEvents(){
    this.onTagEvent('deliver-shipment-button', 'click', (e) => {
      this.onModalOpen();
    });
  }

  onModalOpen(){
    this.createWebcModal({
      template: 'deliverShipmentModal',
      model:this.model,
      controller: 'DeliverShipmentModalController',
      disableBackdropClosing: false,
      disableFooter: true,
      disableHeader: true,
      disableExpanding: true,
      disableClosing: false,
      disableCancelButton: true,
      expanded: false,
      centered: true,
    });
  }


}
