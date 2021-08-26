const shipmentViewModel = {
	form: {
		shipperId: {
			label: 'Shipper ID',
			name: 'shipper-id',
			required: true,
			placeholder: 'Shipper ID',
			disabled: false,
			type: 'text',
			value: ''
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
			label: 'Dimension (m)',
			height: {
				label: 'H',
				name: 'height',
				required: true,
				disabled: false,
				type: 'number',
				value: ''
			},
			length: {
				label: 'L',
				name: 'length',
				required: true,
				disabled: false,
				type: 'number',
				value: ''
			},
			width: {
				label: 'W',
				name: 'width',
				required: true,
				disabled: false,
				type: 'number',
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
		}
	}
};

module.exports = shipmentViewModel;
