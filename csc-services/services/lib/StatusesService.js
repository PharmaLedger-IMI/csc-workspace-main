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
          canceledStatuses = [shipmentStatusesEnum.Cancelled];
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
          break;

        // For Site
        case Roles.Site:
          // Set the normal statuses
          normalStatuses = [shipmentStatusesEnum.InTransit,shipmentStatusesEnum.Delivered];
          // Set the Approved statuses
          approvedStatuses = [shipmentStatusesEnum.Received];
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

        let normalKitStatuses = [kitsStatusesEnum.AvailableForAssignment,kitsStatusesEnum.Assigned,kitsStatusesEnum.Received];
        let approvedKitStatuses = [kitsStatusesEnum.Dispensed];

        return {
          normalKitStatuses : normalKitStatuses,
          approvedKitStatuses: approvedKitStatuses
        }
      }
}

const statusesService = new StatusesService();

module.exports = statusesService;