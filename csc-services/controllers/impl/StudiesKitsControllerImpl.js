const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const SearchService = cscServices.SearchService;
const { Topics, Commons, Roles } = cscServices.constants;
const { studiesKitsTableHeaders, kitsStatusesEnum } = cscServices.constants.kit;

class StudiesKitsControllerImpl extends WebcController {

  constructor(role, ...props) {
    super(...props);
    this.role = role;
    this.kitsService = new KitsService();
    this.searchService = new SearchService(studiesKitsTableHeaders);
    this.model = this.getKitsViewModel();
    this.model.kitsListIsReady = false;
    this.attachEvents();
    this.init();
  }

  async init() {
    await this.getKits();
    eventBusService.addEventListener(Topics.RefreshKits, async (data) => {
      await this.getKits();
    });
  }

  async getKits() {
    try {
      this.model.kitsListIsReady = false;
      const kitsStudies = await this.kitsService.getAllStudiesKits();
      this.kitsStudies = this.transformData(kitsStudies);
      this.setKitsModel(this.kitsStudies);
      this.model.kitsListIsReady = true;
    } catch (error) {
      console.log(error);
    }
  }
  onReady(){
    this.searchFilterHandler();
  }

  filterKitsByStatus(kits, status){
    return kits.filter(kit => kit.status.find((statusItem) => statusItem.status === status));
  }

  transformData(data) {
    const ordersKits = {};
    data.forEach(studyData => {
      for (let i = 0; i < studyData.kits.length; i++) {
        if (!ordersKits[studyData.kits[i].orderId]) {
          ordersKits[studyData.kits[i].orderId] = {...studyData, orderId:studyData.kits[i].orderId,kits:[]};
        }
        ordersKits[studyData.kits[i].orderId].kits.push(studyData.kits[i]);
      }
    });

    let studiesKits = [];
    for (let orderId in ordersKits) {
      studiesKits.push(ordersKits[orderId]);
    }

    studiesKits.forEach((item) => {
      item.lastModified = momentService(item.lastModified).format(Commons.DateTimeFormatPattern);
      item.kitsNumber = item.kits.length;
      item.kitsAvailable = {
        progress: this.filterKitsByStatus(item.kits, kitsStatusesEnum.AvailableForAssignment).length,
        total: item.kitsNumber
      };
      item.kitsAssigned = {
        progress: this.filterKitsByStatus(item.kits, kitsStatusesEnum.Assigned).length,
        total: item.kitsNumber
      };
      item.kitsDispensed = {
        progress: this.filterKitsByStatus(item.kits, kitsStatusesEnum.Dispensed).length,
        total: item.kitsNumber,
      };
      item.kitsReturned = {
        progress: this.filterKitsByStatus(item.kits, kitsStatusesEnum.Returned).length,
        total: item.kitsNumber,
      };
      item.kitsReconciled = {
        progress: this.filterKitsByStatus(item.kits, kitsStatusesEnum.Reconciled).length,
        total: item.kitsNumber,
        approved: true
      };
    });
    return studiesKits;
  }

  attachEvents() {
    this.attachExpressionHandlers();
    this.addKitButtonsHandlers();
  }

  attachExpressionHandlers() {
    this.model.addExpression('kitsListNotEmpty', () => {
      return this.model.kits && Array.isArray(this.model.kits) && this.model.kits.length > 0;
    }, 'kits');
  }

  async addKitButtonsHandlers() {

    this.onTagClick('view-kit', async (model) => {
      this.navigateToPageTag('study-kits', {
        studyId: model.studyId,
        orderId:model.orderId
      });
    });

    //only Sponsor should be able to synchronize
    if(this.role === Roles.Sponsor){
      this.onTagClick('synchronize-study-kits', async (model) => {
        const synchronizeKits = async () => {
          this.model.kitsMounting = {
            progress: 0,
            importInProgress: true,
            eta: '-'
          };

          let redirectToStudyKits = async () => {
            await this.kitsService.markStudyKitsAsSynchronized(model.studyId);
            eventBusService.dispatchEvent(Topics.RefreshKits, null);
          };

          this.showModalFromTemplate('kitMountingProgressModal', redirectToStudyKits.bind(this), redirectToStudyKits.bind(this), {
            controller: 'KitMountingProgressController',
            modalTitle: `Study ${model.studyId}: Kits Synchronization`,
            disableExpanding: true,
            disableBackdropClosing: true,
            disableClosing: true,
            disableCancelButton: true,
            model: this.model
          });

          await this.kitsService.mountStudyKits(model.uid, (err, progress) => {
            this.model.kitsMounting.progress = parseInt(progress * 100);
          });
        };

        this.showModal(
          'New kits were received by the SITE. You have to synchronize them before continuing. This operation may take some time',
          'Kits Synchronization',
          synchronizeKits,
          () => {
          },
          {
            disableExpanding: true,
            cancelButtonText: 'Not now',
            confirmButtonText: 'Synchronize now',
            id: 'confirm-modal'
          }
        );
      });
    }
  }

  searchFilterHandler() {
    //TODO: check why search.value is changed in the initialization phase
      const filterData = this.filterData.bind(this);
      this.model.onChange('search.value', () => {
        setTimeout(filterData, 300);
      });
    }

  filterData() {
    let result = this.kitsStudies;
    result = this.searchService.filterData(result, null, this.model.search.value);
    this.setKitsModel(result);
  }

  setKitsModel(kits) {
    this.model.kits = kits;
    this.model.data = kits;
    this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
  }

  getKitsViewModel() {
    return {
      search: this.getSearchViewModel(),
      kits: [],
      kitsListNotEmpty: true,
      pagination: this.getPaginationViewModel(),
      headers: studiesKitsTableHeaders,
      tableLength: studiesKitsTableHeaders.length,
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
controllersRegistry.registerController('StudiesKitsController', StudiesKitsControllerImpl);
