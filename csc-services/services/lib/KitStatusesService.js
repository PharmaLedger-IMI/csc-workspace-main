const {kitsStatusesEnum} = require('../constants/kit');

class KitStatusesService {

  constructor() {}

  getKitStatuses() {

      let normalKitStatuses = [kitsStatusesEnum.AvailableForAssignment,kitsStatusesEnum.Assigned,kitsStatusesEnum.Received];
      let approvedKitStatuses = [kitsStatusesEnum.Dispensed];

      return {
        normalKitStatuses : normalKitStatuses,
        approvedKitStatuses: approvedKitStatuses
      }
    }
}

const kitStatusesService = new KitStatusesService();

module.exports = kitStatusesService;