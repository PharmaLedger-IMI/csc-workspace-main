const kitsStatusesEnum = {
	Received: 'Received',
	AvailableForAssignment: 'Available for Assignment',
	Assigned: 'Assigned',
	Dispensed: 'Dispensed',
	Administrated: 'Administrated'
};


const kitsPendingActionEnum = {
	ManageKit:"Manage Kit",
	Assign: 'Assign',
	Dispense: 'Dispense',
	NoFurtherActionsRequired: 'No further actions required'
};

const kitsMessagesEnum = {
	ShipmentSigned: 'Shipment Signed By Site',
}

const studiesKitsTableHeaders = [
	{
		column: 'studyId',
		label: 'Study ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'studyId'
	},
	{
		column: 'orderId',
		label: 'Order ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'orderId'
	},
	{
		column: 'numberOfKits',
		label: 'Number of Kits',
		notSortable: false,
		type: 'number',
		asc: null,
		desc: null,
		value: 'orderId'
	},
	{
		column: 'available',
		label: 'Available',
		notSortable: false,
		type: 'number',
		asc: null,
		desc: null,
		value: 'orderId'
	},
	{
		column: 'assigned',
		label: 'Assigned',
		notSortable: false,
		type: 'number',
		asc: null,
		desc: null,
		value: 'orderId'
	},
	{
		column: 'dispensed',
		label: 'Dispensed',
		notSortable: false,
		type: 'number',
		asc: null,
		desc: null,
		value: 'orderId'
	},
	{
		column: 'lastModified',
		label: 'Last Modified',
		type: 'date',
		notSortable: false,
		asc: null,
		desc: null,
		value: 'lastModified'
	},
	{
		column: null,
		label: 'View',
		notSortable: true,
		desc: null
	}
]

const kitsTableHeaders = [
	{
		column: 'kitId',
		label: 'Kit ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'kitId'
	},
	{
		column: 'shipmentId',
		label: 'Shipment ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'shipmentId'
	},
	{
		column: 'orderId',
		label: 'Order ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'orderId'
	},
	{
		column: 'investigatorId',
		label: 'Investigator ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'investigatorId'
	},
	{
		column: 'receivedDate',
		label: 'Received Date',
		notSortable: false,
		type: 'date',
		asc: null,
		desc: null,
		value: 'receivedDate'
	},
	{
		column: 'status',
		label: 'Kit Status',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'status_value'
	},
	{
		column: 'lastModified',
		label: 'Last Modified',
		type: 'date',
		notSortable: false,
		asc: null,
		desc: null,
		value: 'lastModified'
	},
	{
		column: null,
		label: 'View',
		notSortable: true,
		desc: null
	}
];

module.exports = {
	kitsStatusesEnum,
	kitsTableHeaders,
	studiesKitsTableHeaders,
	kitsPendingActionEnum,
	kitsMessagesEnum
};