const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const { Topics, Commons } = cscServices.constants;
const { kitsTableHeaders, kitsStatusesEnum } = cscServices.constants.kit;

class KitsControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);

		this.kitsService = new KitsService(this.DSUStorage);
		this.model = this.getKitsViewModel();
		this.model.kitsListIsReady = false;
		this.attachEvents();
		this.init();
	}

	async init() {
		let { studyId, orderId } = this.history.location.state;
		this.model.studyId = studyId;
		this.model.orderId = orderId;
		await this.getKits();
		eventBusService.addEventListener(Topics.RefreshKits, async (data) => {
			await this.getKits();
		});
	}

	async getKits() {
		try {
			this.model.kitsListIsReady = false;
			const orderKits = await this.kitsService.getOrderKits(this.model.studyId, this.model.orderId);
			this.kits = this.transformData(orderKits);
			this.setKitsModel(this.kits);
			this.model.kitsListIsReady = true;
		} catch (error) {
			console.log(error);
		}
	}

	transformData(data) {
		if (data) {
			data.forEach((item) => {

				const receivedStatus = item.status[0];
				const latestStatus = item.status.sort(function(a, b) {
					return new Date(b.date) - new Date(a.date);
				})[0];

				item.investigatorId = data.investigatorId?data.investigatorId:"-";
				item.status_value = latestStatus.status;
				item.receivedDate = momentService(receivedStatus.date).format(Commons.DateTimeFormatPattern);
				item.lastModified = latestStatus.date ? momentService(latestStatus.date).format(Commons.DateTimeFormatPattern) : '-';
				item.status_administered = item.status_value === kitsStatusesEnum.Administrated;
				item.status_normal = !item.status_administered;
			});
		}

		return data;
	}

	attachEvents() {
		this.attachExpressionHandlers();
		this.viewKitHandler();
		this.searchFilterHandler();

		this.onTagClick('dashboard', () => {
			this.navigateToPageTag('dashboard');
		});

		this.onTagClick('kits-management', () => {
			this.navigateToPageTag('dashboard', { tab: Topics.Kits });
		});
	}

	attachExpressionHandlers() {
		this.model.addExpression('kitsListNotEmpty', () => {
			return this.model.kits && Array.isArray(this.model.kits) && this.model.kits.length > 0;
		}, 'kits');
	}

	async viewKitHandler() {
		this.onTagClick('view-kit', async (model) => {
			this.navigateToPageTag('kit', { keySSI: model.keySSI });
		});
	}

	searchFilterHandler() {
		this.model.onChange('search.value', () => {
			setTimeout(() => {
				this.filterData();
			}, 300);
		});
	}

	filterData() {
		let result = this.kits;
		if (this.model.search.value && this.model.search.value !== '') {
			result = result.filter((x) =>
				x.kitId.toString().toUpperCase().search(this.model.search.value.toUpperCase()) !== -1 ||
				x.shipmentId.toString().toUpperCase().search(this.model.search.value.toUpperCase()) !== -1 ||
				x.investigatorId.toString().toUpperCase().search(this.model.search.value.toUpperCase()) !== -1 ||
				x.status_value.toString().toUpperCase().search(this.model.search.value.toUpperCase()) !== -1
			);
		}

		this.setKitsModel(result);
	}

	setKitsModel(kits) {
		this.model.kits = kits;
		this.model.data = kits;
		this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
	}

	getKitsViewModel() {
		return {
			filter: '',
			search: this.getSearchViewModel(),
			kits: [],
			kitsListNotEmpty: true,
			pagination: this.getPaginationViewModel(),
			headers: kitsTableHeaders,
			tableLength: kitsTableHeaders.length,
			defaultSortingRule: {
				sorting: 'desc',
				column: "lastModified",
				type : 'date'
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
controllersRegistry.registerController('KitsController', KitsControllerImpl);
