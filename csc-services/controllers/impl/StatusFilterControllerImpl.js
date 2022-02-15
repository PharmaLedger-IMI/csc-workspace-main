const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const StatusesServices = cscServices.StatusesService;

class StatusFilterControllerImpl extends WebcController {

  constructor(role, ...props) {
    super(...props);
    this.role = role;
    this.model.statuses = {};
    let statuses = {};
    let allItems = "All items"
    switch (true) {
      case typeof this.model.orders !== 'undefined':
        statuses = StatusesServices.getOrderStatuses();
        allItems = "All Orders";
        break;
      case typeof this.model.shipments !== 'undefined':
        statuses = StatusesServices.getShipmentStatusesByRole(this.role);
        allItems = "All Shipments";
        break;
      case typeof this.model.kits !== 'undefined':
        statuses = StatusesServices.getKitStatuses();
        allItems = "All Kits";
        break;
    }


    const allStatuses = [].concat(...Object.keys(statuses).map(statusesType =>
      statuses[statusesType].map(status => {
        return {
          status: status,
          statusId: 'filter-' + status
        };
      })
    ));


    this.model.statuses.allStatuses = allStatuses;
    this.model.statuses.allItems = allItems;

    this.filterChangedHandler();
    this.filterClearedHandler();
  }


  filterChangedHandler() {
    this.onTagClick('filters-changed', async (model, target) => {
      const selectedFilter = target.getAttribute('data-custom') || null;
      if (selectedFilter) {
        document.getElementById(`filter-${this.model.filter}`).classList.remove('selected');
        this.model.filter = selectedFilter;
        document.getElementById(`filter-${this.model.filter}`).classList.add('selected');
      }
    });
  }

  filterClearedHandler() {
    this.onTagClick('filters-cleared', async () => {
      document.getElementById(`filter-${this.model.filter}`).classList.remove('selected');
      this.model.filter = '';
      document.getElementById(`filter-${this.model.filter}`).classList.add('selected');
      this.model.search.value = null;
    });
  }

}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('StatusFilterController', StatusFilterControllerImpl);
