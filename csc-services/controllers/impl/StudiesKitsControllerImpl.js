const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const eventBusService = cscServices.EventBusService;
const momentService = cscServices.momentService;
const searchService = cscServices.SearchService;
const { Topics, Commons, searchEnum } = cscServices.constants;
const { studiesKitsTableHeaders, kitsStatusesEnum } = cscServices.constants.kit;

class StudiesKitsControllerImpl extends WebcController {

  constructor(role, ...props) {
    super(...props);

    this.kitsService = new KitsService(this.DSUStorage);
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

  filterKitsByLastStatus(kits, status){
    return kits.filter(kit => kit.status[kit.status.length-1].status === status)
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
      item.kitsAvailable = this.filterKitsByLastStatus(item.kits,kitsStatusesEnum.AvailableForAssignment).length;
      item.kitsAssigned = this.filterKitsByLastStatus(item.kits,kitsStatusesEnum.Assigned).length;
      item.kitsDispensed = this.filterKitsByLastStatus(item.kits,kitsStatusesEnum.Dispensed).length;
    });
    return studiesKits;
  }

  attachEvents() {
    this.attachExpressionHandlers();
    this.viewKitHandler();
    this.searchFilterHandler();
  }

  attachExpressionHandlers() {
    this.model.addExpression('kitsListNotEmpty', () => {
      return this.model.kits && Array.isArray(this.model.kits) && this.model.kits.length > 0;
    }, 'kits');
  }

  async viewKitHandler() {
    this.onTagClick('view-kit', async (model) => {
      this.navigateToPageTag('study-kits', {
        studyId: model.studyId,
        orderId:model.orderId
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

  filterData() {
    let result = this.kitsStudies;
    result = searchService.filterData(result, this.model.filter, this.model.search.value, searchEnum.KitsStudies);
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
      headers: studiesKitsTableHeaders,
      tableLength: studiesKitsTableHeaders.length,
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
controllersRegistry.registerController('StudiesKitsController', StudiesKitsControllerImpl);
