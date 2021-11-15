

class SearchService {

    constructor(itemStatusesEnum, tableHeaders) { 
        this.itemStatusesEnum = itemStatusesEnum;
        this.searchedProperties = tableHeaders.filter(header=>header.notSortable===false).map( header => header.column);
    }

    filterData(result, filter, searchValue) {

        if (filter) {
            result = result.filter((x) => x.status_value === this.itemStatusesEnum[filter]);
          }
          if (searchValue && searchValue !== '') {
      
            result = result.filter((x) => {
              const matches = this.searchedProperties.filter((property) => {
                return x[property].toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
              });
              return matches.length > 0;
            });
          }
          return result;
    }

}


module.exports = SearchService;