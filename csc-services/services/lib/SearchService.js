

class SearchService {

    constructor(itemStatusesEnum, searchedProperties) { 
        this.itemStatusesEnum = itemStatusesEnum;
        let forDeletion = ['requestDate', 'deliveryDate','requestDeliveryDate','schedulePickupDate','numberOfKits','available','assigned','dispensed'];
        this.searchedProperties = searchedProperties
                                  .filter(item => !forDeletion.includes(item))
                                  .map(function(item) { return item == 'status' ? 'status_value' : item; })
                                  .map(function(item) { return item == 'shipperID' ? 'shipperId' : item; });
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