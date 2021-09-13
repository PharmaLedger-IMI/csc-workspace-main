const { BaseShipmentsController } = WebCardinal.controllers;

const cscServices = require('csc-services');

const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const ShipmentService = cscServices.ShipmentService;

const { Topics, Commons, Roles } = cscServices.constants;
const {
  shipmentStatusesEnum,
  shipmentCMOTableHeaders,
  shipmentSiteTableHeaders,
  shipmentSponsorTableHeaders,
  shipmentCourierTableHeaders
} = cscServices.constants.shipment;


export default class ShipmentsController extends BaseShipmentsController {

  constructor(...props) {

    let role = Roles.Courier;

    super(...props);

    this.role = role;
    // this.model = this.getShipmentsViewModel();
    // this.shipmentService = new ShipmentService(this.DSUStorage);
    //
    // this.init();
    // this.attachEvents();
    // this.attachEventHandlers();

    setTimeout( () => {
      console.log(this.shipments);
    }, 2000);

  }

  getTableHeaders() {
    return shipmentCourierTableHeaders;
  }

}
