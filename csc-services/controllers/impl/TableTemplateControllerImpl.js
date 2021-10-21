// eslint-disable-next-line no-undef
const cscServices = require('csc-services');
const { WebcController } = WebCardinal.controllers;
const momentService = cscServices.momentService;

class TableTemplateControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    this.role = role;
    this.attachEvents();
    this.init();
  }

  sortingFn(column, sorting, type){
    return ( a, b ) => {

      let compA = "";
      let compB = "";

      if(sorting && type && column){

        switch(type){
          case('date'):
             compA = momentService(a[column]).valueOf();
             compB = momentService(b[column]).valueOf();
             break;
          case('string'):
          case('number'):
             compA = a[column];
             compB = b[column];
             break;
        }

        switch(sorting){
          case('asc') :
            return compA <= compB ? 1 : -1;
          case('desc') :
            return compA >= compB ? -1 : 1;
        }

      }
    }
  }

  async init() {
    this.paginateData(this.model.data);
    // Init Sort of Table
    if (this.model.defaultSortingRule) {
      this.sortColumn(this.model.defaultSortingRule.column, this.model.defaultSortingRule.sorting, this.model.defaultSortingRule.type);
    }
  }

  attachEvents() {
    this.model.onChange('data', () => {
      this.paginateData(this.model.data);
    });

    this.onTagClick('navigate-to-page', async (model) => {
      this.paginateData(this.model.data, model.value ? parseInt(model.value) : model.data);
    });

    this.onTagClick('go-to-previous-page', async () => {
      if (this.model.pagination.currentPage !== 1) {
        this.paginateData(this.model.data, this.model.pagination.currentPage - 1);
      }
    });

    this.onTagClick('go-to-next-page', async () => {
      if (this.model.pagination.currentPage !== this.model.pagination.totalPages) {
        this.paginateData(this.model.data, this.model.pagination.currentPage + 1);
      }
    });

    this.onTagClick('go-to-last-page', async () => {
      const length = this.model.data.length;
      const numberOfPages = Math.ceil(length / this.model.pagination.itemsPerPage);
      if (this.model.pagination.currentPage !== numberOfPages) {
        this.paginateData(this.model.data, numberOfPages);
      }
    });

    this.onTagClick('go-to-first-page', async () => {
      if (this.model.pagination.currentPage !== 1) {
        this.paginateData(this.model.data, 1);
      }
    });

    this.on('set-items-per-page', async (event) => {
      this.model.pagination.itemsPerPage = parseInt(event.data.value);
      this.paginateData(this.model.data, 1);
    });

    this.onTagClick('sort-column', async (model) => {
      console.log("[EVENT] sort-column", model);
      this.sortColumn(model.column);
    });
  }

  paginateData(data, page = 1) {
    //no need for lodash
    data = JSON.parse(JSON.stringify(data));
    if (data && data.length > 0) {
      const itemsPerPage = this.model.pagination.itemsPerPage;
      const length = data.length;
      const numberOfPages = Math.ceil(length / itemsPerPage);
      const pages = Array.from({ length: numberOfPages }, (_, i) => i + 1).map((x) => ({
        label: x,
        value: x,
        active: page === x,
      }));

      this.model.pagination.previous = !(page > 1 && pages.length > 1);
      this.model.pagination.next = !(page < pages.length && pages.length > 1);
      this.model.pagination.items = data.slice(itemsPerPage * (page - 1), itemsPerPage * page);
      this.model.pagination.pages = {
        // options: pages.map((x) => ({
        //   value: x.value,
        //   label: x.value,
        // })),
        selectOptions: pages.map((x) => x.value).join(' | '),
        value: page.toString(),
      };
      this.model.pagination.slicedPages = pages.length > 5 && page - 3 >= 0 && page + 3 <= pages.length ? pages.slice(page - 3, page + 2) : pages.length > 5 && page - 3 < 0 ? pages.slice(0, 5) : pages.length > 5 && page + 3 > pages.length ? pages.slice(pages.length - 5, pages.length) : pages;
      this.model.pagination.currentPage = page;
      this.model.pagination.totalPages = pages.length;
    }
  }

  sortColumn(column, sorting, type) {
    if (column || this.model.headers.some((x) => x.asc || x.desc)) {
      if (!column) column = this.model.headers.find((x) => x.asc || x.desc).column;

      const headers = this.model.headers;
      const selectedColumn = headers.find((x) => x.column === column);
      const idx = headers.indexOf(selectedColumn);

      if (headers[idx].notSortable) return;

      if (headers[idx].asc || headers[idx].desc) {
        let data = JSON.parse(JSON.stringify(this.model.data));

          data.reverse();

        this.model.data = data;
        this.model.headers = this.model.headers.map((x) => {
          if (x.column !== column) {
            return { ...x, asc: false, desc: false };
          } else return { ...x, asc: !headers[idx].asc, desc: !headers[idx].desc };
        });
      } else {
        this.model.headers = this.model.headers.map((x) => {
          if (x.column !== column) {
            return { ...x, asc: false, desc: false };
          } else return { ...x, asc: true, desc: false };
        });

        const data = JSON.parse(JSON.stringify(this.model.data));

        if(sorting && type){
          this.model.data = data.sort(this.sortingFn(column, sorting, type));
        }else{
          this.model.data = data.sort((a, b) => (a[column] >= b[column] ? 1 : -1));
        }
      }
    } else {
      this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
    }
  }
}

const controllersRegistry = require("../ControllersRegistry").getControllersRegistry();
controllersRegistry.registerController("TableTemplateController", TableTemplateControllerImpl);
