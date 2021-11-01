const { shipmentStatusesEnum } = require('../constants/shipment');
const { kitsStatusesEnum } = require('../constants/kit');
const { orderStatusesEnum } = require('../constants/order');
const { searchEnum } = require('../constants');

class SearchService {

    constructor() { }

    filterData(result, filter, searchValue, searchType) {
        switch (searchType) {
            case searchEnum.Order: {
                if (filter) {
                    result = result.filter((x) => x.status_value === orderStatusesEnum[filter]);
                }
                if (searchValue && searchValue !== '') {
                    result = result.filter((x) => x.orderId.toUpperCase().search(escape(searchValue.toUpperCase())) !== -1);
                }
                return result;
            }

            case searchEnum.Shipment: {
                if (filter) {
                    result = result.filter((x) => x.status_value === shipmentStatusesEnum[filter]);
                }
                if (searchValue && searchValue !== '') {
                    result = result.filter((x) => x.orderId.toUpperCase().search(escape(searchValue.toUpperCase())) !== -1);
                }
                return result;
            }

            case searchEnum.Kit: {
                if (filter) {
                    result = result.filter((x) => x.status_value === kitsStatusesEnum[filter]);
                }
                if (searchValue && searchValue !== '') {
                    result = result.filter((x) =>
                        x.kitId.toString().toUpperCase().search(escape(searchValue.toUpperCase())) !== -1 ||
                        x.shipmentId.toString().toUpperCase().search(escape(searchValue.toUpperCase())) !== -1 ||
                        x.investigatorId.toString().toUpperCase().search(escape(searchValue.toUpperCase())) !== -1 ||
                        x.status_value.toString().toUpperCase().search(escape(searchValue.toUpperCase())) !== -1
                    );
                }
                return result;
            }

            case searchEnum.KitsStudies: {
                if (searchValue && searchValue !== '') {
                    result = result.filter((x) =>
                        x.studyId.toString().toUpperCase().search(escape(searchValue.toUpperCase())) !== -1 ||
                        x.orderId.toString().toUpperCase().search(escape(searchValue.toUpperCase())) !== -1
                    );
                }
                return result;
            }

        }
        return;
    }

}


const searchService = new SearchService();
module.exports = searchService;