// eslint-disable-next-line no-undef
const cscServices = require('csc-services');
const { WebcController } = WebCardinal.controllers;
const momentService = cscServices.momentService;

class TableTemplateControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    this.role = role;
    this.attachEvents();
    let sortingDatesFnAsc = this.sortingDatesFn('asc');
    let sortingDatesFnDesc = this.sortingDatesFn('desc');
    this.model.data = this.sortDataByLastModification(this.model.data, 'lastModified' , sortingDatesFnDesc);
    this.init();
  }

  sortingDatesFn(type){
    return ( a, b ) => {

      const compA = momentService(a).valueOf();
      const compB = momentService(b).valueOf();

      switch(type){
        case('asc') :
          return compA < compB ? 1 : -1;
        case('desc') :
          return compA > compB ? 1 : -1;
      }
    }
  }

  sortDataByLastModification( data , prop , sortingDatesFn ){
    if(data){
      if(data[0]){
        if(data[0].hasOwnProperty(prop)){
          data = data.sort(sortingDatesFn);
        }
      }
    }
    return data;
  }

  async init() {
    this.paginateData(this.model.data);
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

  sortColumn(column) {
    if (column || this.model.headers.some((x) => x.asc || x.desc)) {
      if (!column) column = this.model.headers.find((x) => x.asc || x.desc).column;

      const headers = this.model.headers;
      const selectedColumn = headers.find((x) => x.column === column);
      const idx = headers.indexOf(selectedColumn);

      if (headers[idx].notSortable) return;

      if (headers[idx].asc || headers[idx].desc) {
        const data = JSON.parse(JSON.stringify(this.model.data));
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
        this.model.data = data.sort((a, b) => (a[column] >= b[column] ? 1 : -1));
      }
    } else {
      this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
    }
  }
}

const controllersRegistry = require("../ControllersRegistry").getControllersRegistry();
controllersRegistry.registerController("TableTemplateController", TableTemplateControllerImpl);
