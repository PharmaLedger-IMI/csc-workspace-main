const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const SearchService = cscServices.SearchService;
const { Topics, Commons, Roles } = cscServices.constants;
const { kitsTableHeaders } = cscServices.constants.kit;
const statusesService = cscServices.StatusesService;

class KitsControllerImpl extends WebcController {

	constructor(role, ...props) {
		super(...props);
		this.role = role;
		this.kitsService = new KitsService();
		this.searchService = new SearchService(kitsTableHeaders);
		this.model = this.getKitsViewModel();
		this.model.kitsListIsReady = false;
		this.attachEvents();
		this.init();
		console.log(this.model);
	}

	async init() {
		let { studyId, orderId } = this.history.location.state;
		this.model.studyId = studyId;
		this.model.orderId = orderId;

		const studyKits = await this.kitsService.getStudyKits(studyId);

		if(!studyKits.synchronized && this.role === Roles.Sponsor){
			 this.synchronizeKits(studyKits)
		}

		await this.getKits();
		this.searchFilterHandler();
		eventBusService.addEventListener(Topics.RefreshKits, async (data) => {
			await this.getKits();
		});
	}

	synchronizeKits(studyKits){
		const synchronizeKits = async () => {
			this.model.kitsMounting = {
				progress: 0,
				importInProgress: true,
				eta: '-'
			};

			let redirectToStudyKits = async () => {
				await this.kitsService.markStudyKitsAsSynchronized(this.model.studyId);
			};

			this.showModalFromTemplate('kitMountingProgressModal', redirectToStudyKits.bind(this), redirectToStudyKits.bind(this), {
				controller: 'KitMountingProgressController',
				modalTitle: `Study ${this.model.studyId}: Kits Synchronization`,
				disableExpanding: true,
				disableBackdropClosing: true,
				disableClosing: true,
				disableCancelButton: true,
				model: this.model
			});

			await this.kitsService.mountStudyKits(studyKits.uid, (err, progress) => {
				this.model.kitsMounting.progress = parseInt(progress * 100);
			});
		};

		this.showModal(
			'New kits were received by the SITE. You have to synchronize them before continuing. This operation may take some time',
			'Kits Synchronization',
			synchronizeKits,
			() => {
				this.navigateToPageTag('dashboard', { tab: Topics.Kits });
			},
			{
				disableExpanding: true,
				cancelButtonText: 'Not now',
				confirmButtonText: 'Synchronize now',
				id: 'confirm-modal'
			}
		);
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

				item.investigatorId = item.investigatorId ? item.investigatorId : '-';
				const statuses = statusesService.getKitStatuses();
				const normalStatuses = statuses.normalKitStatuses;
				const approvedStatuses = statuses.approvedKitStatuses;
				const cancelledStatuses = statuses.canceledKitsStatuses;
				const inQuarantineStatues = statuses.quarantineStatuses;
				const pendingDestructionStatuses = statuses.pendingDestructionStatuses;
				const requestRelabelingStatuses = statuses.requestRelabelingStatuses;
				const blockedStatuses = statuses.blockedStatuses;

				item.status_value = latestStatus.status;
				item.receivedDate = momentService(receivedStatus.date).format(Commons.DateTimeFormatPattern);
				item.lastModified = latestStatus.date ? momentService(latestStatus.date).format(Commons.DateTimeFormatPattern) : '-';
				item.status_approved = approvedStatuses.indexOf(item.status_value) !== -1;
				item.status_normal = normalStatuses.indexOf(item.status_value) !== -1;
				item.status_in_quarantine = inQuarantineStatues.indexOf(item.status_value) !== -1;
				item.status_pending_destruction = pendingDestructionStatuses.indexOf(item.status_value) !== -1;
				item.status_cancelled = cancelledStatuses.indexOf(item.status_value) !== -1;
				item.status_request_relabeling = requestRelabelingStatuses.indexOf(item.status_value) !== -1;
				item.status_blocked = blockedStatuses.indexOf(item.status_value) !== -1;

			});

		}
		return data;
	}

	attachEvents() {
		this.attachExpressionHandlers();
		this.viewKitHandler();

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
			this.navigateToPageTag('kit', { uid: model.uid });
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
		let result = this.kits;
		result = this.searchService.filterData(result, this.model.filter, this.model.search.value);
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
			totalPages: null,
			itemsPerPage: {
				options: itemsPerPageArray,
				value: itemsPerPageArray[1]
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
