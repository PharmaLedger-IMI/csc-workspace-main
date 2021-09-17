const constants = require("csc-services").constants
const orderBusinessRequirements = constants.order.orderBusinessRequirements;
const DAYS_AHEAD = orderBusinessRequirements.DeliveryDateDaysAhead;
const TEMPERATURE_UNITS = orderBusinessRequirements.TemperatureUnits;
const MIN_TEMPERATURE = orderBusinessRequirements.MinTemperature;
const MAX_TEMPERATURE = orderBusinessRequirements.MaxTemperature;
const momentService = require("csc-services").momentService;
const sites = orderBusinessRequirements.sites;
const cmos = orderBusinessRequirements.cmos;
const SPONSOR_DID = orderBusinessRequirements.sponsorId;
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
                value: SPONSOR_DID,
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
                required: true,
                disabled: false,
                value: '',
            },
            target_cmo_id: {
                label: 'Target CMO ID',
                name: 'target_cmo_id',
                id: 'target_cmo_id',
                placeholder: 'Select Target CMO ID...',
                required: true,
                disabled: false,
                options: cmos.map((x) => {return {label:x.name, value:x.name}}),
                value: cmos[0].name,
            },
            study_id: {
                label: 'Study ID',
                name: 'study_id',
                required: true,
                placeholder: 'e.g ABC123X56789',
                disabled: false,
                value: '',
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
                required: true,
                placeholder: 'No File',
                disabled: false,
                value: '',
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
                placeholder: 'Select Site ID...',
                required: true,
                disabled: false,
                options: sites.map((x) => {return {label:x.name, value:x.name}}),
                value: sites[0].name,
            },
            site_region_id: {
                label: 'Site Region ID (Autofilled)',
                name: 'site_region_id',
                required: true,
                placeholder: '',
                disabled: true,
                value: '',
            },
            site_country: {
                label: 'Site Country (Autofilled)',
                name: 'site_country',
                required: true,
                placeholder: '',
                disabled: true,
                value: '',
            },
            temperature_comments: {
                label: 'Temperature Comments',
                name: 'temperature_comments',
                required: true,
                placeholder: 'e.g Do not freeze',
                disabled: false,
                value: '',
            },
            keep_between_temperature: {
                andLabel: "and",
                label: 'Keep between (' + TEMPERATURE_UNITS + ')',
                name: 'keep_between_temperature',
                required: true,
                placeholder: '',
                disabled: false,
                value: '',
            },
            keep_between_temperature_min: {
                label: 'Min Temperature (' + TEMPERATURE_UNITS + ')',
                name: 'keep_between_temperature_min',
                required: true,
                placeholder: '',
                disabled: false,
                value: '',
                min: MIN_TEMPERATURE,
                max: MAX_TEMPERATURE,
            },
            keep_between_temperature_max: {
                label: 'Max Temperature (°C)',
                name: 'keep_between_temperature_max',
                required: true,
                placeholder: '',
                disabled: false,
                value: '',
                min: MIN_TEMPERATURE,
                max: MAX_TEMPERATURE,
            },
            add_comment: {
                label: 'Add a Comment',
                name: 'add_comment',
                required: true,
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
