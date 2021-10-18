const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const OrdersService = cscServices.OrderService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const { Topics, Commons } = cscServices.constants;
const { orderTableHeaders, orderStatusesEnum } = cscServices.constants.order;

class OrdersControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);

		this.ordersService = new OrdersService(this.DSUStorage);
		this.model = this.getOrdersViewModel();
		this.model.ordersListIsReady = false;
		this.attachEvents();
		this.init();
	}

	async init() {
		await this.getOrders();
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
				item.status_value = latestStatus.status;
				item.status_approved = item.status_value === orderStatusesEnum.Approved;
				item.status_cancelled = item.status_value === orderStatusesEnum.Canceled;
				item.status_normal = !item.status_approved && !item.status_cancelled;
				item.lastModified = latestStatus.date ? momentService(latestStatus.date).format(Commons.DateTimeFormatPattern) : '-';
			});
		}

		return data;
	}

	attachEvents() {
		this.attachExpressionHandlers();
		this.viewOrderHandler();

		this.searchFilterHandler();
		this.filterChangedHandler();
		this.filterClearedHandler();
	}

	attachExpressionHandlers() {
		this.model.addExpression('ordersListNotEmpty', () => {
			return this.model.orders && Array.isArray(this.model.orders) && this.model.orders.length > 0;
		}, 'orders');
	}

	viewOrderHandler() {
		this.onTagClick('view-order', async (model) => {
			const orderId = model.orderId;
			console.log(
				JSON.stringify(
					this.orders.find((x) => x.orderId === orderId),
					null,
					2
				)
			);
			this.navigateToPageTag('order', {
				id: orderId,
				keySSI: this.orders.find((x) => x.orderId === orderId).orderSSI,
				documentsKeySSI: this.orders.find((x) => x.orderId === orderId).documentsKeySSI
			});
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
				document.getElementById(`filter-${this.model.filter}`).classList.remove('selected');
				this.model.filter = selectedFilter;
				document.getElementById(`filter-${this.model.filter}`).classList.add('selected');
				this.filterData();
			}
		});
	}

	filterClearedHandler() {
		this.onTagClick('filters-cleared', async () => {
			document.getElementById(`filter-${this.model.filter}`).classList.remove('selected');
			this.model.filter = '';
			document.getElementById(`filter-${this.model.filter}`).classList.add('selected');
			this.model.search.value = null;
			this.filterData();
		});
	}

	filterData() {
		let result = this.orders;

		if (this.model.filter) {
			result = result.filter((x) => x.status_value === orderStatusesEnum[this.model.filter]);
		}
		if (this.model.search.value && this.model.search.value !== '') {
			result = result.filter((x) => x.orderId.toUpperCase().search(this.model.search.value.toUpperCase()) !== -1);
		}

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
			tableLength: orderTableHeaders.length
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
