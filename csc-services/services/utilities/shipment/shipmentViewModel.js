const constants = require("csc-services").constants
const shipmentBusinessRequirements = constants.shipment.shipmentBusinessRequirements;
const shippers = shipmentBusinessRequirements.shippers;
const momentService = require("csc-services").momentService;
const DAYS_AHEAD = 2;

const shipmentViewModel = {
	form: {
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
		shipperId: {
			label: 'Shipper ID',
			name: 'shipper-id',
			id: 'shipper-id',
			required: true,
			placeholder: 'Select Shipper ID',
			disabled: false,
			options: shippers.map(x => { return { label: x.name, value: x.name } }),
			value: shippers[0].name
		},
		origin: {
			label: 'Origin',
			name: 'origin',
			required: true,
			placeholder: 'Origin',
			disabled: false,
			type: 'text',
			value: ''
		},
		sponsorId: {
			label: 'Sponsor ID',
			name: 'sponsor_id',
			required: true,
			disabled: true,
			value: '',
		},
		type: {
			label: 'Type',
			name: 'type',
			id: 'type',
			required: true,
			disabled: false,
			options: [
				{ label: 'air', value: 'air' },
				{ label: 'road', value: 'road' },
				{ label: 'ocean', value: 'ocean' }
			],
			value: 'air'
		},
		pickupDate: {
			label: 'Scheduled Pickup Date/Time',
			name: 'pickup-date',
			required: true,
			disabled: false,
			type: 'date',
			min: momentService(new Date()).add(DAYS_AHEAD, 'days').format(constants.Commons.YearMonthDayPattern),
			value: ''
		},
		pickupTime: {
			name: 'pickup-time',
			required: true,
			disabled: false,
			type: 'time',
			value: ''
		},
		dimension: {
			label: 'Dimension (' + shipmentBusinessRequirements.dimensionUnit + ')',
			height: {
				label: 'H',
				name: 'height',
				required: true,
				placeholder: 'Fill in the height',
				disabled: false,
				type: 'number',
				min: '0.0001',
				value: ''
			},
			length: {
				label: 'L',
				name: 'length',
				required: true,
				placeholder: 'Fill in the length',
				disabled: false,
				type: 'number',
				min: '0.0001',
				value: ''
			},
			width: {
				label: 'W',
				name: 'width',
				required: true,
				placeholder: 'Fill in the width',
				disabled: false,
				type: 'number',
				min: '0.0001',
				value: ''
			}
		},
		specialInstructions: {
			label: 'Special Instructions',
			name: 'special-instructions',
			required: true,
			placeholder: 'These are the special instructions',
			disabled: false,
			value: ''
		},
		shippingConditions: {
			label: 'Shipping/Handling Conditions',
			name: 'shipping-conditions',
			required: true,
			placeholder: 'These are the Shipping/Handling Conditions',
			disabled: false,
			value: ''
		},
		billNumber: {
			label: 'Master-way bill number',
			name: 'bill-number',
			required: true,
			placeholder: 'Master-way bill number',
			disabled: false,
			value: '',
		},
		hsCode: {
			label: 'HS Code',
			name: 'hs-code',
			required: true,
			placeholder: 'HS Code',
			disabled: false,
			value: '',
		},
		recipientName: {
			label: 'Recipient Name',
			name: 'recipient-name',
			required: true,
			placeholder: 'Recipient name',
			disabled: false,
			value: '',
		},
		deliveryDate: {
			label: 'Delivery Date/Time',
			name: 'delivery-date',
			required: true,
			disabled: false,
			type: 'date',
			value: ''
		},
		deliveryTime: {
			name: 'delivery-time',
			required: true,
			disabled: false,
			type: 'time',
			value: ''
		},
		attachment: {
			label: 'Select files',
			listFiles: true,
			filesAppend: false,
			files: [],
		},
		add_comment: {
			label: 'Add a Comment',
			name: 'add_comment',
			required: true,
			placeholder: 'Add a comment',
			disabled: false,
			value: '',
		},
		documents: [],
		temperature: [
			{ value: "Within Range", text: "Within Range" },
			{ value: "Out of Range", text: "Out of Range" },
		],
		comments: [],
        receivedDate: {
            label: 'Received Date/Time',
            name: 'received_date',
            required: true,
            disabled: false,
            type: 'date',
            value: momentService(new Date()).format(constants.Commons.YearMonthDayPattern),
        },
        receivedTime: {
            name: 'received_time',
            required: true,
            disabled: false,
            type: 'time',
            value: momentService(new Date()).format(constants.Commons.HourFormatPattern),
        }
	}
};

module.exports = shipmentViewModel;
