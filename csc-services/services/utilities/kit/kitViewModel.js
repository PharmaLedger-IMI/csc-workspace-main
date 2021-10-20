const constants = require("csc-services").constants;
const orderBusinessRequirements = constants.order.orderBusinessRequirements;
const TEMPERATURE_UNITS = orderBusinessRequirements.TemperatureUnits;

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
            label: 'Received Date/Time',
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
		temperature_observed: {
			label: 'Actual Temperature Observed',
			name: 'Temperature Observed',
			required: true,
			placeholder: 'Temperature Observed',
			disabled: false,
			value: '',
		},
	}
};

module.exports = kitViewModel;