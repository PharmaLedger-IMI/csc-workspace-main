const constants = require("csc-services").constants
const orderBusinessRequirements = constants.order.orderBusinessRequirements;
const DAYS_AHEAD = orderBusinessRequirements.DeliveryDateDaysAhead;
const TEMPERATURE_UNITS = orderBusinessRequirements.TemperatureUnits;
const MIN_TEMPERATURE = orderBusinessRequirements.MinTemperature;
const MAX_TEMPERATURE = orderBusinessRequirements.MaxTemperature;
const momentService = require("csc-services").momentService;
const countries = constants.countries;
const siteRegionIds = orderBusinessRequirements.siteRegionIds;

const orderViewModel = {
    cancelOrderModal: {
        comment: {
            placeholder: 'Enter cancellation reason',
            value: '',
            label: 'Cancellation Reason:'
        },
        commentIsEmpty: true
    },
    accordion: {
        order_details: {
            name: 'Order Details',
            tag: 'order_details_accordion',
            id: 'order_details_accordion',
            isOpened: true,
        },
        attached_documents: {
            name: 'Attached Documents',
            tag: 'attached_documents_accordion',
            id: 'attached_documents_accordion',
            isOpened: false,
        },
        order_comments: {
            name: 'Order Comments',
            tag: 'order_comments_accordion',
            id: 'order_comments_accordion',
            isOpened: false,
        },
    },
    form: {
        inputs: {
            sponsor_id: {
                label: 'Sponsor ID',
                name: 'sponsor_id',
                required: true,
                disabled: true,
                value: "",
            },
            delivery_date: {
                label: 'Delivery Date/Time',
                name: 'delivery_date',
                required: true,
                disabled: false,
                value: '',
                min: momentService(new Date()).add(DAYS_AHEAD, 'days').format(constants.Commons.YearMonthDayPattern)
            },
            delivery_time: {
                name: 'delivery_time',
                required: false,
                disabled: false,
                value: '',
            },
            target_cmo_id: {
                label: 'Target CMO ID',
                name: 'target_cmo_id',
                placeholder: 'e.g did:ssi:name:nvs:sponsor-nvs',
                required: true,
                disabled: false,
                value: "",
            },
            study_id: {
                label: 'Study ID',
                name: 'study_id',
                required: true,
                placeholder: 'e.g ABC123X56789',
                disabled: false,
                value: '',
            },
            study_duration_from:{
                label: 'Study Duration From/To',
                name: 'study_duration_from',
                required: true,
                disabled: false,
                value: '',

            },
            study_duration_to:{
                name: 'study_duration_to',
                required: true,
                disabled: false,
                value: '',
                min: momentService(new Date()).add(DAYS_AHEAD, 'days').format(constants.Commons.YearMonthDayPattern)
            },
            order_id: {
                label: 'Order ID',
                name: 'order_id',
                required: true,
                placeholder: 'e.g O-000001234',
                disabled: false,
                value: '',
            },
            kit_id_list: {
                label: 'Kit ID List (.csv)',
                name: 'kit_id_list',
                placeholder: 'No File',
            },
            kit_ids_attachment: {
                label: 'Upload File',
                listFiles: false,
                filesAppend: false,
                files: [],
                name: 'No File',
                ids: [],
                error: '',
            },
            site_id: {
                label: 'Site ID',
                name: 'site_id',
                id: 'site_id',
                placeholder: 'e.g did:ssi:name:epe:hospital-espirito-santo-evora',
                required: true,
                disabled: false,
                value: "",
            },
            site_region_id: {
                label: 'Site Region ID',
                name: 'site_region_id',
                required: false,
                placeholder: 'Enter Site Region ID',
                disabled: false,
                options: siteRegionIds,
                value: siteRegionIds[0],
            },
            site_country: {
                label: 'Site Country',
                name: 'site_country',
                required: true,
                placeholder: 'Enter Site Country',
                disabled: false,
                options: countries,
                value: countries[0].name,
            },
            temperature_comments: {
                label: 'Temperature Comments',
                name: 'temperature_comments',
                required: false,
                placeholder: 'e.g Do not freeze',
                disabled: false,
                value: '',
            },
            keep_between_temperature: {
                andLabel: "and",
                label: 'Keep between (' + TEMPERATURE_UNITS + ')',
                name: 'keep_between_temperature',
                required: false,
                placeholder: '',
                disabled: false,
                value: '',
            },
            keep_between_temperature_min: {
                label: 'Min Temperature (' + TEMPERATURE_UNITS + ')',
                name: 'keep_between_temperature_min',
                required: false,
                placeholder: '',
                disabled: false,
                value: '',
                min: MIN_TEMPERATURE,
                max: MAX_TEMPERATURE,
            },
            keep_between_temperature_max: {
                label: 'Max Temperature (°C)',
                name: 'keep_between_temperature_max',
                required: false,
                placeholder: '',
                disabled: false,
                value: '',
                min: MIN_TEMPERATURE,
                max: MAX_TEMPERATURE,
            },
            add_comment: {
                label: 'Add a Comment',
                name: 'add_comment',
                required: false,
                placeholder: 'Add a comment....',
                disabled: false,
                value: '',
            },
        },
        docs: {},
        attachment: {
            label: 'Select files',
            listFiles: true,
            filesAppend: false,
            files: [],
        },
        documents: [],
        comments: [],
    },

}

module.exports = orderViewModel;
