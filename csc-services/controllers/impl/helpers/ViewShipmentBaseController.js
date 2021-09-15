const cscServices = require('csc-services');
const FileDownloaderService = cscServices.FileDownloaderService;
const { WebcController } = WebCardinal.controllers;
const { shipmentStatusesEnum, shipmentPendingActionEnum } = cscServices.constants.shipment;
const momentService = cscServices.momentService;
const { Commons, FoldersEnum, Topics, Roles } = cscServices.constants;

class ViewShipmentBaseControllerImpl extends WebcController{

  constructor(...props) {
    super(...props);

    this.FileDownloaderService = new FileDownloaderService(this.DSUStorage);
  }

  navigationHandlers() {
    this.onTagClick('nav-back', () => {
      this.history.goBack();
    });

    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Shipment });
    });
  }

  downloadAttachmentHandler() {
    this.onTagClick('download-file', async (model) => {
      const { name, attached_by } = model;
      let keySSI;
      switch (attached_by) {
        case Roles.Sponsor: {
          keySSI = this.model.orderModel.order.sponsorDocumentsKeySSI;
          break;
        }
        case Roles.CMO: {
          keySSI = this.model.orderModel.order.cmoDocumentsKeySSI;
          break;
        }
        case Roles.Courier: {
          keySSI = this.model.shipmentModel.shipment.courierDocumentsKeySSI;
          break;
        }
      }

      await this.downloadFile(name, FoldersEnum.Documents, keySSI);
    });
  }

  downloadKitListHandler() {
    this.onTagClick('download-kits-file', async (model) => {
      const { kitsFilename, kitsSSI } = model.order;
      await this.downloadFile(kitsFilename, FoldersEnum.Kits, kitsSSI);
    });
  }

  async downloadFile(filename, rootFolder, keySSI) {
    window.WebCardinal.loader.hidden = false;
    const path = rootFolder + '/' + keySSI + '/' + 'files';
    await this.FileDownloaderService.prepareDownloadFromDsu(path, filename);
    this.FileDownloaderService.downloadFileToDevice(filename);
    window.WebCardinal.loader.hidden = true;
  }

  toggleAccordionItemHandler() {
    this.onTagEvent('toggle-accordion', 'click', (model, target) => {
      const targetIcon = target.querySelector('.accordion-icon');
      target.classList.toggle('accordion-item-active');
      targetIcon.classList.toggle('rotate-icon');

      const panel = target.nextElementSibling;
      if (panel.style.maxHeight === '1000px') {
        panel.style.maxHeight = '0px';
      } else {
        panel.style.maxHeight = '1000px';
      }
    });
  }

  openFirstAccordion() {
    const accordion = this.querySelector('.accordion-item');
    const targetIcon = accordion.querySelector('.accordion-icon');
    const panel = accordion.nextElementSibling;

    accordion.classList.toggle('accordion-item-active');
    targetIcon.classList.toggle('rotate-icon');
    panel.style.maxHeight = '1000px';
  }

  showHistoryHandler() {
    this.onTagEvent('history-button', 'click', () => {
      this.onShowHistoryClick();
    });
  }

  onShowHistoryClick() {
    let { orderModel, shipmentModel } = this.model.toObject();
    const historyModel = {
      shipment: shipmentModel.shipment,
      currentPage: Topics.Shipment
    };
    if(orderModel){
      historyModel.order = orderModel.order
    }

    this.createWebcModal({
      template: 'historyModal',
      controller: 'HistoryModalController',
      model: historyModel,
      disableBackdropClosing: false,
      disableFooter: true,
      disableExpanding: true,
      disableClosing: false,
      disableCancelButton: true,
      expanded: false,
      centered: true,
    });
  }


  getDateTime(str) {
    const dateTime = str.split(' ');
    return {
      date: dateTime[0],
      time: dateTime[1]
    };
  }

  transformShipmentData(data) {
    if (data) {
      data.status_value = data.status.sort((function(a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].status;
      if (data.status_value === shipmentStatusesEnum.ShipmentCancelled) {
        data.status_value = shipmentStatusesEnum.Cancelled;
      }

      data.status_date = momentService(data.status.sort((function(a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].date).format(Commons.DateTimeFormatPattern);

      const normalStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch];
      const approvedStatuses = [shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered, shipmentStatusesEnum.Received];
      data.status_approved = approvedStatuses.indexOf(data.status_value) !== -1;
      data.status_cancelled = data.status_value === shipmentStatusesEnum.Cancelled;
      data.status_normal = normalStatuses.indexOf(data.status_value) !== -1;
      data.pending_action = this.getPendingAction(data.status_value);
      data.contextualContent = {
        afterReadyForDispatch: data.status.findIndex(el => el.status === shipmentStatusesEnum.ReadyForDispatch) !== -1,
        afterInTransit: data.status.findIndex(el => el.status === shipmentStatusesEnum.InTransit) !== -1,
        afterDelivered: data.status.findIndex(el => el.status === shipmentStatusesEnum.Delivered) !== -1,
        afterReceived: data.status.findIndex(el => el.status === shipmentStatusesEnum.Received) !== -1
      };

      if (data.comments) {
        data.comments.forEach((comment) => {
          comment.date = momentService(comment.date).format(Commons.DateTimeFormatPattern);
        });
      }

      data.documents = [];
      if (data.courierDocuments) {
        data.courierDocuments.forEach((doc) => {
          doc.date = momentService(doc.date).format(Commons.DateTimeFormatPattern);
          data.documents.push(doc);
        });
      }

      return data;
    }

    return {};
  }

  getPendingAction(status_value) {
    switch (status_value) {
      case shipmentStatusesEnum.InPreparation:
        return shipmentPendingActionEnum.PendingReadyForDispatch;

      case shipmentStatusesEnum.ReadyForDispatch:
        return shipmentPendingActionEnum.PendingPickUp;

      case shipmentStatusesEnum.InTransit:
        return shipmentPendingActionEnum.PendingDelivery;

      case shipmentStatusesEnum.Delivered:
        return shipmentPendingActionEnum.PendingReception;

      case shipmentStatusesEnum.Received:
        return shipmentPendingActionEnum.ManageKits;
    }

    return '-';
  }
}
const controllersRegistry = require('../../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ViewShipmentBaseController', ViewShipmentBaseControllerImpl);
module.exports = ViewShipmentBaseControllerImpl;