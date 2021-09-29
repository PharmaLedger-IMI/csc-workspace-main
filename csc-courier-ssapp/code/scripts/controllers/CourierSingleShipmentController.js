const { ViewShipmentBaseController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const ShipmentsService = cscServices.ShipmentService;
const CommunicationService = cscServices.CommunicationService;
const eventBusService = cscServices.EventBusService;
const { Roles, Topics } = cscServices.constants;
const { shipmentStatusesEnum } = cscServices.constants.shipment;

class CourierSingleShipmentController extends ViewShipmentBaseController {
  constructor(...props) {
    super(...props);
    let communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.COU_IDENTITY);
    this.shipmentsService = new ShipmentsService(this.DSUStorage, communicationService);
    this.initViewModel();
    this.openFirstAccordion();
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.showHistoryHandler();
    this.toggleAccordionItemHandler();
    this.downloadAttachmentHandler();
    this.navigationHandlers();

    this.onTagEvent('edit-shipment', 'click', () => {
      this.navigateToPageTag('edit-shipment', {
        shipment: this.model.toObject('shipmentModel.shipment'),
        role: Roles.Courier
      });
    });

    this.onTagEvent('add-shipment-comment', 'click', (e) => {
      this.onAddShipmentCommentModalOpen();
    });
  }

  setShipmentActions(shipment) {
    const actions = {
      canPickupShipment:false,
      canEditShipment:false,
      canAddMessage:false,
      canDeliverShipment:false
    };

    switch (shipment.status[0].status) {
      case shipmentStatusesEnum.ReadyForDispatch:
        actions.canPickupShipment = true;
        break;
      case shipmentStatusesEnum.InTransit:
        if (shipment.shipmentBilling) {
          actions.canAddMessage = true;
          actions.canDeliverShipment = true;
        } else {
          actions.canEditShipment = true;
        }
        break;
    }
    return actions;
  }

  async initViewModel() {
    const model = {
      shipmentModel: viewModelResolver('shipment'),
    };

    //all fields are disabled
    for (let prop in model.form) {
      model.form[prop].disabled = true;
    }
    let { keySSI } = this.history.location.state;
    model.keySSI = keySSI;
    let shipment = await this.shipmentsService.getShipment(model.keySSI);
    shipment = { ...this.transformShipmentData(shipment) };
    model.shipmentModel.shipment = shipment;

    if (model.shipmentModel.shipment.shipmentComments) {
      model.shipmentModel.shipment.comments = await this.getShipmentComments(model.shipmentModel.shipment);
    }

    if (model.shipmentModel.shipment.shipmentDocuments) {
      model.shipmentModel.shipment.documents = await this.getShipmentDocuments(model.shipmentModel.shipment);
    }

    model.actions = this.setShipmentActions(model.shipmentModel.shipment);
    console.log(model);
    this.model = model;
    let modalOpen = false;
    this.attachRefresh(modalOpen);
  }

  attachRefresh(modalOpen) {
    eventBusService.addEventListener(Topics.RefreshShipments, async () => {
      if (!modalOpen) {
        modalOpen = true;
        let title = 'Shipment Updated';
        let content = 'Shipment was updated, New status is available';
        let modalOptions = {
          disableExpanding: true,
          confirmButtonText: 'Update View',
          id: 'confirm-modal'
        };

        this.showModal(content, title, this.initViewModel.bind(this), this.initViewModel.bind(this), modalOptions);
      }
    });
  }

  onAddShipmentCommentModalOpen(){
    this.createWebcModal({
      template: 'addShipmentCommentModal',
      model:this.model,
      controller: 'AddShipmentCommentModalController',
      disableBackdropClosing: true,
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

export default CourierSingleShipmentController;
