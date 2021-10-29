const { Roles } = require('../constants');
const { shipmentStatusesEnum } = require('../constants/shipment');
const { kitsStatusesEnum } = require('../constants/kit');

class StatusesService {

  constructor() {}

  getShipmentStatusesByRole( role ) {

    let normalStatuses = [];
    let approvedStatuses = [];

    if(role){
      // Set Normal Statuses by Roles
      switch (role) {
        // For Sponsor
        case Roles.Sponsor:
          // Set the normal statuses
          normalStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch, shipmentStatusesEnum.PickUpAtWarehouse, shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered];
          // Set the Approved statuses
          approvedStatuses = [shipmentStatusesEnum.Received];
          break;
        // For CMO
        case Roles.CMO:
          // Set the normal statuses
          normalStatuses = [shipmentStatusesEnum.InPreparation, shipmentStatusesEnum.ReadyForDispatch];
          // Set the Approved statuses
          approvedStatuses = [shipmentStatusesEnum.Dispatched];
          break;

        // For Courier
        case Roles.Courier:
          // Set the normal statuses
          normalStatuses = [shipmentStatusesEnum.ReadyForDispatch, shipmentStatusesEnum.PickUpAtWarehouse, shipmentStatusesEnum.InTransit, shipmentStatusesEnum.Delivered];
          // Set the Approved statuses
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
      approvedStatuses: approvedStatuses
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