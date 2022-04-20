const { Roles } = require('../constants');
const { shipmentStatusesEnum } = require('../constants/shipment');
const {orderStatusesEnum} = require('../constants/order');
const { kitsStatusesEnum } = require('../constants/kit');

class StatusesService {

  constructor() {}

  getOrderStatuses() {

    let normalStatuses = [orderStatusesEnum.Initiated, orderStatusesEnum.InProgress];
    let approvedStatuses = [orderStatusesEnum.Completed];
    let canceledStatuses = [orderStatusesEnum.Canceled];
    return { normalStatuses, approvedStatuses, canceledStatuses };

  }


  getShipmentStatusesByRole( role ) {

    let normalStatuses = [];
    let approvedStatuses = [];
    let canceledStatuses = [];

    if(role){
      // Set Normal Statuses by Roles
      switch (role) {
        // For Sponsor
        case Roles.Sponsor:
          normalStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch, shipmentStatusesEnum.PickUpAtWarehouse, shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered];
          approvedStatuses = [shipmentStatusesEnum.Received];
          canceledStatuses = [shipmentStatusesEnum.Cancelled, shipmentStatusesEnum.WrongDeliveryAddress];
          break;
        // For CMO
        case Roles.CMO:
          normalStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch];
          approvedStatuses = [shipmentStatusesEnum.Dispatched];
          canceledStatuses = [shipmentStatusesEnum.Cancelled];
          break;

        // For Courier
        case Roles.Courier:
          normalStatuses = [shipmentStatusesEnum.ReadyForDispatch, shipmentStatusesEnum.PickUpAtWarehouse, shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered];
          approvedStatuses = [shipmentStatusesEnum.ProofOfDelivery];
          canceledStatuses = [shipmentStatusesEnum.WrongDeliveryAddress];
          break;

        // For Site
        case Roles.Site:
          normalStatuses = [shipmentStatusesEnum.InTransit,shipmentStatusesEnum.Delivered];
          approvedStatuses = [shipmentStatusesEnum.Received];
          canceledStatuses = [shipmentStatusesEnum.WrongDeliveryAddress];
          break;
      }
    }

    return {
      normalStatuses : normalStatuses,
      approvedStatuses : approvedStatuses,
      canceledStatuses : canceledStatuses
    }
  }

  getKitStatuses() {
        let normalKitStatuses = [kitsStatusesEnum.Received, kitsStatusesEnum.AvailableForAssignment,kitsStatusesEnum.Assigned, kitsStatusesEnum.Dispensed, kitsStatusesEnum.Returned];
        let approvedKitStatuses = [kitsStatusesEnum.Reconciled];
        let canceledStatuses = [kitsStatusesEnum.InQuarantine, kitsStatusesEnum.PendingDestruction, kitsStatusesEnum.Destroyed]

        return {
          normalKitStatuses : normalKitStatuses,
          approvedKitStatuses: approvedKitStatuses,
          canceledKitsStatuses : canceledStatuses
        }
      }
}

const statusesService = new StatusesService();

module.exports = statusesService;