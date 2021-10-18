const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');

const utilitiesService = cscServices.UtilitiesService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const ShipmentService = cscServices.ShipmentService;

const { Topics, Commons, Roles } = cscServices.constants;
const {
  shipmentStatusesEnum,
  shipmentCMOTableHeaders,
  shipmentSiteTableHeaders,
  shipmentSponsorTableHeaders
} = cscServices.constants.shipment;

class ShipmentsControllerImpl extends WebcController {

  constructor(role, ...props) {
    super(...props);

    this.role = role;
    this.model = this.getShipmentsViewModel();
    this.model.shipmentsListIsReady = false;
    this.shipmentService = new ShipmentService(this.DSUStorage);

    this.init();
    this.attachEvents();
    this.attachEventHandlers();
  }

  async init() {
    await this.getShipments();
    eventBusService.addEventListener(Topics.RefreshShipments, async (data) => {
      await this.getShipments();
    });
  }

  async getShipments() {
    try {
      this.model.shipmentsListIsReady = false;
      const shipmentsList = await this.shipmentService.getShipments();
      this.shipments = this.transformData(shipmentsList);
      this.setShipmentsModel(this.shipments);
      this.model.shipmentsListIsReady = true;
    } catch (error) {
      console.log(error);
    }
  }

  setShipmentsModel(shipments) {
    this.model.shipments = shipments;
    this.model.data = shipments;
    this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
  }

  attachEvents() {
    this.attachEventHandlers();
    this.viewShipmentHandler();

    this.searchFilterHandler();
    this.filterChangedHandler();
    this.filterClearedHandler();
  }

  transformData(data) {
    if (data) {

      const statuses = utilitiesService.getNormalAndApproveStatusByRole(this.role);
      const normalStatuses = statuses.normalStatuses;
      const approvedStatuses = statuses.approvedStatuses;

      data.forEach((item) => {
        item.orderId = item.orderId || '-';
        item.shipmentId = item.shipmentId || '-';
        item.shipperId = item.shipperId || '-';
        item.origin = item.origin || '-';
        item.type = item.shipmentType || '-';
        item.recipientName = item.recipientName || '-';

        const latestStatus = item.status.sort(function(a, b) {
          return new Date(b.date) - new Date(a.date);
        })[0];

        item.status_value = latestStatus.status === shipmentStatusesEnum.ShipmentCancelled ? shipmentStatusesEnum.Cancelled : latestStatus.status;
        item.status_approved = approvedStatuses.indexOf(item.status_value) !== -1;
        item.status_cancelled = item.status_value === shipmentStatusesEnum.Cancelled;
        item.status_normal = normalStatuses.indexOf(item.status_value) !== -1;

        item.lastModified = latestStatus.date ? momentService(latestStatus.date).format(Commons.DateTimeFormatPattern) : '-';
        item.requestDate = item.requestDate ? momentService(item.requestDate).format(Commons.DateTimeFormatPattern) : '-';
        item.scheduledPickupDate = this.getPickupDateTime(item.scheduledPickupDateTime);
      });
    }

    return data;
  }

  viewShipmentHandler() {
    this.onTagClick('view-shipment', (model) => {
      this.navigateToPageTag('shipment', { keySSI: model.keySSI });
    });
  }

  searchFilterHandler() {
    this.model.onChange('search.value', () => {
      setTimeout(() => {
        this.filterData();
      }, 300);
    });
  }

  filterChangedHandler() {
    this.onTagClick('filters-changed', async (model, target) => {
      const selectedFilter = target.getAttribute('data-custom') || null;
      if (selectedFilter) {
        this.querySelector(`#filter-${this.model.filter}`).classList.remove('selected');
        this.model.filter = selectedFilter;
        this.querySelector(`#filter-${this.model.filter}`).classList.add('selected');
        this.filterData();
      }
    });
  }

  filterClearedHandler() {
    this.onTagClick('filters-cleared', async () => {
      this.querySelector(`#filter-${this.model.filter}`).classList.remove('selected');
      this.model.filter = '';
      this.querySelector(`#filter-${this.model.filter}`).classList.add('selected');
      this.model.search.value = null;
      this.filterData();
    });
  }

  filterData() {
    let result = this.shipments;
    if (this.model.filter) {
      result = result.filter((x) => x.status_value === shipmentStatusesEnum[this.model.filter]);
    }
    if (this.model.search.value && this.model.search.value !== '') {
      result = result.filter((x) => x.orderId.toUpperCase().search(this.model.search.value.toUpperCase()) !== -1);
    }

    this.setShipmentsModel(result);
  }

  attachEventHandlers() {
    this.model.addExpression('shipmentsListNotEmpty', () => {
      return this.model.shipments && Array.isArray(this.model.shipments) && this.model.shipments.length > 0;
    }, 'shipments');
  }

  getShipmentsViewModel() {
    const tableHeaders = this.getTableHeaders();
    return {
      filter: '',
      search: this.getSearchViewModel(),
      pagination: this.getPaginationViewModel(),
      headers: tableHeaders,
      tableLength: tableHeaders.length,
      shipmentsArrayNotEmpty: true,
      shipments: []
    };
  }

  getSearchViewModel() {
    return {
      placeholder: 'Search',
      value: ''
    };
  }

  getPaginationViewModel() {
    const itemsPerPageArray = [5, 10, 15, 20, 30];

    return {
      previous: false,
      next: false,
      items: [],
      pages: {
        selectOptions: ''
      },
      slicedPages: [],
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: null,
      itemsPerPageOptions: {
        selectOptions: itemsPerPageArray.join(' | '),
        value: itemsPerPageArray[1].toString()
      }
    };
  }

  getPickupDateTime(scheduledPickupDate) {
    if (scheduledPickupDate) {
      const timestamp = new Date(`${scheduledPickupDate.date} ${scheduledPickupDate.time}`).getTime();
      return momentService(timestamp).format(Commons.DateTimeFormatPattern);
    }

    return '-';
  }

  getTableHeaders() {
    switch (this.role) {
      case Roles.CMO: {
        return shipmentCMOTableHeaders;
      }
      case Roles.Site: {
        return shipmentSiteTableHeaders;
      }
      case Roles.Sponsor: {
        return shipmentSponsorTableHeaders;
      }
    }

    return [];
  }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ShipmentsController', ShipmentsControllerImpl);
