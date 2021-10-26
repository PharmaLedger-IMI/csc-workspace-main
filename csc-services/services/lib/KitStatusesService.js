const { Roles } = require('../constants');
const {kitsStatusesEnum} = require('../constants/kit');

class KitStatusesService {

  constructor() {}

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

const kitStatusesService = new KitStatusesService();

module.exports = kitStatusesService;