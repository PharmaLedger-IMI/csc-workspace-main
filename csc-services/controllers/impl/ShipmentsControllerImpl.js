const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const { shipmentTableHeaders} = cscServices.constants.shipment;

class ShipmentsControllerImpl extends WebcController {

  constructor(role, ...props) {
    super(...props);

    this.model = this.getShipmentsViewModel();
    this.setOrdersModel(this.getFakeShipmentData());

    this.init();

    this.attachEventHandlers();
  }

  async init() {}

  setOrdersModel(shipments) {
    this.model.shipments = shipments;
    this.model.data = shipments;
    this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
  }
  attachEventHandlers(){
    this.model.onChange("shipments" , () => {
      this.model.shipmentsArrayNotEmpty = this.model.shipments.length >=1;
    });
  }

  getFakeShipmentData(){
    return [
      { "shipmentDate" : new Date().toISOString(), "shipperId" : "123123123", "specialInstructions" : "You have to do this.", "typeShipment" : "type_a",
        "dimension" : {
          "dimensionHeight" : 100,
          "dimensionWidth" : 200,
          "dimensionLength" : 300
        },
        "origin" : "Greece", "scheduledPickupDateTime" : new Date().toISOString(), "shippingCondition" : "broken", "signature" : "",
      },
      { "shipmentDate" : new Date().toISOString(), "shipperId" : "123123123", "specialInstructions" : "You have to do this.", "typeShipment" : "type_a",
        "dimension" : {
          "dimensionHeight" : 100,
          "dimensionWidth" : 200,
          "dimensionLength" : 300
        },
        "origin" : "Greece", "scheduledPickupDateTime" : new Date().toISOString(), "shippingCondition" : "broken", "signature" : "",
      },
      { "shipmentDate" : new Date().toISOString(), "shipperId" : "123123123", "specialInstructions" : "You have to do this.", "typeShipment" : "type_a",
        "dimension" : {
          "dimensionHeight" : 100,
          "dimensionWidth" : 200,
          "dimensionLength" : 300
        },
        "origin" : "Greece", "scheduledPickupDateTime" : new Date().toISOString(), "shippingCondition" : "broken", "signature" : "",
      }
    ];
  }

  getShipmentsViewModel() {
    return {
      filter: '',
      search: this.getSearchViewModel(),
      pagination: this.getPaginationViewModel(),
      headers: shipmentTableHeaders,
      tableLength: shipmentTableHeaders.length,
      shipmentsArrayNotEmpty: false,
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
}

const controllersRegistry = require("../ControllersRegistry").getControllersRegistry();
controllersRegistry.registerController("ShipmentsController", ShipmentsControllerImpl);
