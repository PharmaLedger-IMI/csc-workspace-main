const { BaseShipmentsController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const {Roles } = cscServices.constants;
const {
  shipmentCourierTableHeaders
} = cscServices.constants.shipment;


export default class ShipmentsController extends BaseShipmentsController {

  constructor(...props) {
    let role = Roles.Courier;
    super(...props);
    this.role = role;
  }

  getTableHeaders() {
    return shipmentCourierTableHeaders;
  }

}
