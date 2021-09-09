const { WebcController } = WebCardinal.controllers;

export default class ScanShipmentController extends WebcController {

  constructor(...props) {
    super(...props);

    this.model = {};

    this.onEvents();
  }


  onEvents(){
    this.onTagEvent('scan-shipment-button', 'click', (e) => {
      this.onModalOpen();
    });
  }

  onModalOpen(){
    this.createWebcModal({
      template: 'scanShipmentModal',
      controller: 'ScanShipmentModalController',
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
