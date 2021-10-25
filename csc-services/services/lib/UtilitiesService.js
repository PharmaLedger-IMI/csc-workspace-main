const { Roles } = require('../constants');
const {shipmentStatusesEnum} = require('../constants/shipment');
const {kitsStatusesEnum} = require('../constants/kit');

class UtilitiesService {

  // Constructor of the service
  constructor() {}

  getNormalAndApproveStatusByRole( role ) {

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
          normalStatuses = [shipmentStatusesEnum.InTransit,shipmentStatusesEnum.Delivered,kitsStatusesEnum.AvailableForAssignment,kitsStatusesEnum.Assigned,kitsStatusesEnum.Dispensed];
          // Set the Approved statuses
          approvedStatuses = [shipmentStatusesEnum.Received,kitsStatusesEnum.Received];
          break;
      }
    }

    return {
      normalStatuses : normalStatuses,
      approvedStatuses: approvedStatuses
    }
  }

  getNormalAndApproveKitStatusByRole( role ) {

      let normalKitStatuses = [];
      let approvedKitStatuses = [];

      if(role){
        switch (role) {
          case Roles.Sponsor:
            normalKitStatuses = [kitsStatusesEnum.AvailableForAssignment,kitsStatusesEnum.Assigned,kitsStatusesEnum.Received];
            approvedKitStatuses = [kitsStatusesEnum.Dispensed];
            break;
          case Roles.Site:
            normalKitStatuses = [kitsStatusesEnum.AvailableForAssignment,kitsStatusesEnum.Assigned,kitsStatusesEnum.Received];
            approvedKitStatuses = [kitsStatusesEnum.Dispensed];
            break;
        }
      }

      return {
        normalKitStatuses : normalKitStatuses,
        approvedKitStatuses: approvedKitStatuses
      }
    }
}

const utilitiesService = new UtilitiesService();

module.exports = utilitiesService;
