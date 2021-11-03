

class SearchService {

    constructor(itemStatusesEnum, searchedProperties) { 
        this.itemStatusesEnum = itemStatusesEnum;
        this.searchedProperties = searchedProperties;
    }

    filterData(result, filter, searchValue) {

        if (filter) {
            result = result.filter((x) => x.status_value === this.itemStatusesEnum[filter]);
          }
          if (searchValue && searchValue !== '') {
      
            result = result.filter((x) => {
              const matches = this.searchedProperties.filter((property) => {
                x[property].toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
              });
              return matches.length > 0;
            });
          }
          return result;
    }

}


module.exports = SearchService;