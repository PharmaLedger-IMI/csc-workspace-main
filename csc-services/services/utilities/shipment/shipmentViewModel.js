const constants = require("csc-services").constants
const shipmentBusinessRequirements = constants.shipment.shipmentBusinessRequirements;
const momentService = require("csc-services").momentService;
const countries = constants.countries;
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
		courierId: {
			label: 'Courier ID',
			name: 'courier-id',
			id: 'courier-id',
			required: true,
			placeholder: 'Enter Courier ID',
			disabled: false,
			value: ""
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
		transportMode: {
			label: 'Mode of Transport',
			name: 'transport_mode',
			id: 'transport-mode',
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
		volumeUoM: {
			label: 'Volume UoM',
			name: 'volume_uom',
			id: 'volume-uom',
			required: true,
			disabled: false,
			options: [
				'Meters',
				'Feet',
				'Inches'
			],
			value: 'Meters'
		},
		dimension: {
			label: 'Dimension (' + shipmentBusinessRequirements.dimensionUnit + ')',
			height: {
				label: 'Height',
				name: 'height',
				required: true,
				placeholder: 'Fill in the height',
				disabled: false,
				type: 'number',
				min: '0.0001',
				value: ''
			},
			length: {
				label: 'Length',
				name: 'length',
				required: true,
				placeholder: 'Fill in the length',
				disabled: false,
				type: 'number',
				min: '0.0001',
				value: ''
			},
			width: {
				label: 'Width',
				name: 'width',
				required: true,
				placeholder: 'Fill in the width',
				disabled: false,
				type: 'number',
				min: '0.0001',
				value: ''
			}
		},
		weightUoM:{
			label:"Weight UoM",
			name: 'weight_uom',
			id: 'weight-uom',
			required: true,
			options: [
				'Kg', 'Tones'
			],
			value: 'Kg'
		},
		weight: {
			label: 'Weight',
			name: 'weight',
			required: true,
			placeholder: 'Fill in the weight',
			disabled: false,
			type: 'number',
			min: '0.0001',
			value: ''
		},

		destinationAddress:{
			label:"Destination Address",
			country:  {
				label: 'Country',
				name: 'destination_country',
				required: true,
				disabled: false,
				options: countries,
				value: countries[0].name
			},
			poBox:{
				label: 'PO Box',
				name: 'destination-po-box',
				required: true,
				placeholder: 'Enter PO Box details',
				disabled: false,
				value: ''
			},
			city:{
				label: 'City',
				name: 'destination-city',
				required: true,
				placeholder: 'Enter City name',
				disabled: false,
				value: ''
			},
			street:{
				label: 'Street',
				name: 'destination-street',
				required: true,
				placeholder: 'Enter destination street name',
				disabled: false,
				value: ''
			},
			building:{
				label: 'Building',
				name: 'destination-building',
				required: true,
				placeholder: 'Enter building name/number',
				disabled: false,
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
            value: '',
        },
        receivedTime: {
            name: 'received_time',
            required: true,
            disabled: false,
            type: 'time',
            value: '',
        }
	}
};

module.exports = shipmentViewModel;
