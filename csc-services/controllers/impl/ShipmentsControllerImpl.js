const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const ShipmentsService = cscServices.ShipmentService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const { Topics, Commons } = cscServices.constants;
const { shipmentTableHeaders, shipmentStatusesEnum } = cscServices.constants.shipment;

class ShipmentsControllerImpl extends WebcController {

    constructor(role, ...props) {
        super(...props);

        this.shipmentsService = new ShipmentsService(this.DSUStorage);
        this.model = this.getShipmentsViewModel();

        this.attachEvents();
        this.init();
    }

    async init() {
        await this.getShipments();
        eventBusService.addEventListener(Topics.RefreshShipments, async (data) => {
            await this.getShipments();
        });
    }

    async getShipments() {
        try {
            const shipmentsTemp = await this.shipmentsService.getShipments();
            console.log('shipment: ', shipmentsTemp);
            // this.shipments = this.transformData(shipmentsTemp);
            this.setShipmentsModel(shipmentsTemp);
        } catch (error) {
            console.log(error);
        }
    }

	setShipmentsModel(shipments) {
		this.model.shipments = shipments;
		this.model.data = shipments;
		this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
	}

    getShipmentsViewModel() {
        return {
            filter: '',
            search: this.getSearchViewModel(),
            shipments: [],
            pagination: this.getPaginationViewModel(),
            headers: shipmentTableHeaders,
            tableLength: shipmentTableHeaders.length
        };
    }

    	transformData(data) {
		if (data) {
			data.forEach((item) => {
				item.requestDate_value = momentService(item.requestDate).format(Commons.DateTimeFormatPattern);
				item.lastModified_value = momentService(item.lastModified).format(Commons.DateTimeFormatPattern);

				const latestStatus = item.status.sort(function(a, b) {
					return new Date(b.date) - new Date(a.date);
				})[0];
				item.status_value = latestStatus.status;
				item.status_date = momentService(latestStatus.date).format(Commons.DateTimeFormatPattern);
			});
		}

		return data;
	}

    attachEvents() {
        this.attachExpressionHandlers();
        // this.viewOrderHandler();

        // this.searchFilterHandler();
        // this.filterChangedHandler();
        // this.filterClearedHandler();
    }

    attachExpressionHandlers() {
        this.model.addExpression('shipmentsArrayNotEmpty', () => {
            return this.model.shipments && Array.isArray(this.model.shipments) && this.model.shipments.length > 0;
        }, 'shipments');
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

    getSearchViewModel() {
        return {
            placeholder: 'Search',
            value: ''
        };
    }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ShipmentsController', ShipmentsControllerImpl);