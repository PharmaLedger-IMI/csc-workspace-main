const constants = require('csc-services').constants;
const orderBusinessRequirements = constants.order.orderBusinessRequirements;
const TEMPERATURE_UNITS = orderBusinessRequirements.TemperatureUnits;
const DAYS_AHEAD = orderBusinessRequirements.DeliveryDateDaysAhead;
const momentService = require("csc-services").momentService;

const kitViewModel = {

  form: {
        kitNumber: {
			label: 'Kit Number',
			name: 'kit-number',
			id: 'kit-number',
			required: true,
			placeholder: 'Kit Number',
			disabled: false,
			type: 'text',
			value: ''
		},
        kitId: {
			label: 'Kit ID',
			name: 'kit-id',
			id: 'kit-id',
			required: true,
			placeholder: 'Kit ID',
			disabled: false,
			type: 'text',
			value: ''
		},
		shipmentId: {
			label: 'Shipment ID',
			name: 'shipment-id',
			id: 'shipment-id',
			required: true,
			placeholder: 'Shipment ID',
			disabled: false,
			type: 'text',
			value: ''
		},
		orderId: {
			label: 'Order ID',
			name: 'order-id',
			id: 'order-id',
			required: true,
			placeholder: 'Order ID',
			disabled: false,
			type: 'text',
			value: ''
		},
		studyId: {
			label: 'Study ID',
			name: 'study-id',
            id: 'study-id',
			required: true,
			placeholder: 'Study ID',
			disabled: false,
			type: 'text',
			value: ''
		},
        recipientName: {
			label: 'Recipient Name',
			name: 'recipient-name',
            id: 'recipient-name',
			required: true,
			placeholder: 'Recipient Name',
			disabled: false,
            type: 'text',
			value: ''
		},
		receivedDate: {
            label: 'Shipment Received Date/Time',
            name: 'received_date',
            required: true,
            disabled: false,
            type: 'date',
            value: '',
        },
        receivedTime: {
            name: 'received_time',
            required: true,
            disabled: false,
            type: 'time',
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
            label: 'Min Temperature',
            name: 'keep_between_temperature_min',
            required: true,
            placeholder: '',
            disabled: false,
            value: '',
        },
        keep_between_temperature_max: {
            label: 'Max Temperature (°C)',
            name: 'keep_between_temperature_max',
            required: true,
            placeholder: '',
            disabled: false,
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
		shipment_comment: {
			label: 'Shipment Comment',
			name: 'shipment_comment',
			required: true,
			placeholder: 'Shipment comment',
			disabled: false,
			value: '',
		},
		kit_comment: {
			label: 'Kit Comment',
			name: 'kit_comment',
			required: true,
			placeholder: 'Kit comment',
			disabled: false,
			value: '',
		},
		temperature_observed: {
			label: 'Shipment Actual Temperature Observed',
			name: 'Shipment Temperature Observed',
			required: true,
			placeholder: 'Shipment Temperature Observed',
			disabled: false,
			value: '',
		},
		kit_temperature_observed: {
			label: 'Kit Actual Temperature Observed',
			name: 'Kit Temperature Observed',
			required: true,
			placeholder: 'Kit Temperature Observed',
			disabled: false,
			value: '',
		},
		temperature: [
			{ value: "Within Range", text: "Within Range" },
			{ value: "Out of Range", text: "Out of Range" },
		],
		comments: [],
		add_comment: {
			label: 'Add a Comment',
			name: 'add_comment',
			required: true,
			placeholder: 'Add a comment',
			disabled: false,
			value: '',
		},
		patientId: {
			label: 'Patient ID',
			name: 'patient-id',
			id: 'patient-id',
			required: true,
			placeholder: 'Patient ID',
			disabled: false,
			type: 'text',
			value: '',
		},
		doseType: {
             label: 'Dose Type',
             name: 'dose-type',
             id: 'dose-type',
             required: true,
             placeholder: 'e.g. Syringe',
             disabled: false,
             value: '',
        },
		doseVolume: {
        	label: 'Dose Volume(mL)',
        	name: 'dose-volume',
        	id: 'dose-volume',
        	required: true,
        	placeholder: 'e.g. 10',
        	disabled: false,
        	value: '',
        	min: '0'
        },
    	visitId: {
            label: 'Visit ID',
            name: 'visit-id',
            id: 'visit-id',
            required: true,
            placeholder: 'Enter visit ID',
            disabled: false,
            value: '',
        },
        visit_date: {
             label: 'Visit Date/Time',
             name: 'visit_date',
             required: true,
             disabled: false,
             value: momentService(new Date()).format(constants.Commons.YearMonthDayPattern),
             min: momentService(new Date()).add(DAYS_AHEAD, 'days').format(constants.Commons.YearMonthDayPattern)
        },
        visit_time: {
             name: 'visit_time',
             disabled: false,
             value: momentService(new Date()).format(constants.Commons.HourFormatPattern),
        },
        dispensingPartyId: {
              label: 'Dispensing Party ID',
              name: 'dispensing-id',
              id: 'dispensing-id',
              required: true,
              placeholder: 'Dispensing Party ID',
              value: '',
        },
		investigatorId: {
			label: 'Investigator ID',
			name: 'investigator-id',
			id: 'investigator-id',
			required: true,
			placeholder: 'Investigator ID',
			type: 'text',
			value: '',
	  },
	}

};

module.exports = kitViewModel;