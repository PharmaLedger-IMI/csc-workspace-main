const { WebcController } = WebCardinal.controllers;

export default class ScanShipmentController extends WebcController {

  constructor(...props) {
    super(...props);

    this.onEvents();
  }


  onEvents(){
    this.onTagEvent('scan-shipment-button', 'click', (e) => {
      this.onModalOpen();
    });

    this.onTagEvent('add-shipment-comment-button', 'click', (e) => {
      this.onAddShipmentCommentModalOpen();
    });
  }

  onModalOpen(){
    this.createWebcModal({
      template: 'scanShipmentModal',
      model:this.model,
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

  onAddShipmentCommentModalOpen(){
    this.createWebcModal({
      template: 'addShipmentCommentModal',
      model:this.model,
      controller: 'AddShipmentCommentModalController',
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
