const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const SearchService = cscServices.SearchService;
const statusesService = cscServices.StatusesService;
const { Topics, Commons } = cscServices.constants;
const { orderTableHeaders } = cscServices.constants.order;

class OrdersControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);

		this.ordersService = new OrdersService(this.DSUStorage);
		this.searchService = new SearchService(orderTableHeaders);
		this.model = this.getOrdersViewModel();
		this.model.ordersListIsReady = false;
		this.attachEvents();
		this.init();
	}

	async init() {
		await this.getOrders();
		this.searchFilterHandler();

		eventBusService.addEventListener(Topics.RefreshOrders, async (data) => {
			await this.getOrders();
		});
	}

	async getOrders() {
		try {
			this.model.ordersListIsReady = false;
			const ordersTemp = await this.ordersService.getOrders();
			this.orders = this.transformData(ordersTemp);
			this.setOrdersModel(this.orders);
			this.model.ordersListIsReady = true;
		} catch (error) {
			console.log(error);
		}
	}

	transformData(data) {
		if (data) {
			data.forEach((item) => {
				item.requestDate_value = momentService(item.requestDate).format(Commons.DateTimeFormatPattern);
				item.deliveryDate_value = momentService(item.deliveryDate).format(Commons.DateTimeFormatPattern);

				const latestStatus = item.status.sort(function(a, b) {
					return new Date(b.date) - new Date(a.date);
				})[0];
				const statuses = statusesService.getOrderStatuses();
				item.status_value = latestStatus.status;
				item.status_approved = statuses.approvedStatuses.includes(item.status_value);
				item.status_cancelled = statuses.canceledStatuses.includes(item.status_value);
				item.status_normal = statuses.normalStatuses.includes(item.status_value);
				item.lastModified = latestStatus.date ? momentService(latestStatus.date).format(Commons.DateTimeFormatPattern) : '-';
			});
		}

		return data;
	}

	attachEvents() {
		this.attachExpressionHandlers();
		this.viewOrderHandler();
	}

	attachExpressionHandlers() {
		this.model.addExpression('ordersListNotEmpty', () => {
			return this.model.orders && Array.isArray(this.model.orders) && this.model.orders.length > 0;
		}, 'orders');
	}

	viewOrderHandler() {
		this.onTagClick('view-order', async (model) => {
			const orderId = model.orderId;
			this.navigateToPageTag('order', {
				id: orderId,
				uid: this.orders.find((x) => x.orderId === orderId).uid,
				documentsKeySSI: this.orders.find((x) => x.orderId === orderId).documentsKeySSI
			});
		});
	}

	searchFilterHandler() {
		const filterData = this.filterData.bind(this);
		this.model.onChange('filter', filterData);
		this.model.onChange('search.value', () => {
			setTimeout(filterData, 300);
		});
	}

	filterData() {
		let result = this.orders;
		result = this.searchService.filterData(result, this.model.filter, this.model.search.value);
		this.setOrdersModel(result);
	}

	setOrdersModel(orders) {
		this.model.orders = orders;
		this.model.data = orders;
		this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
	}

	getOrdersViewModel() {
		return {
			filter: '',
			search: this.getSearchViewModel(),
			orders: [],
			ordersListNotEmpty: true,
			pagination: this.getPaginationViewModel(),
			headers: orderTableHeaders,
			tableLength: orderTableHeaders.length,
			defaultSortingRule: {
				sorting: 'desc',
				column: "lastModified",
				type : 'date',
				dateFormat: Commons.DateTimeFormatPattern
			}
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

	getSearchViewModel() {
		return {
			placeholder: 'Search',
			value: ''
		};
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('OrdersController', OrdersControllerImpl);
