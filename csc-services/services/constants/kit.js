const kitsStatusesEnum = {
	Received: 'Received',
	AvailableForAssignment: 'Available for Assignment',
	Assigned: 'Assigned',
	Dispensed: 'Dispensed',
	Returned: 'Returned',
	Reconciled: 'Reconciled',
	InQuarantine:"In Quarantine",
	PendingDestruction:"Pending Destruction",
	Destroyed:"Destroyed",
};


const kitsPendingActionEnum = {
	ManageKit:"Manage Kit",
	Assign: 'Assign',
	Dispense: 'Dispense',
	Return:"Return",
	Reconcile:"Reconcile",
	InQuarantine:"Move to Quarantine",
	PendingDestruction:"Pending Destruction",
	SubmitDestructionDetails:"Submit Destruction Details",
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
		desc: null
	},
	{
		column: 'orderId',
		label: 'Order ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'numberOfKits',
		label: 'Number of Kits',
		notSortable: true,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'available',
		label: 'Available',
		notSortable: true,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'assigned',
		label: 'Assigned',
		notSortable: true,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'dispensed',
		label: 'Dispensed',
		notSortable: true,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'returned',
		label: 'Returned',
		notSortable: true,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'reconciled',
		label: 'Reconciled',
		notSortable: true,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'lastModified',
		label: 'Last Modified',
		type: 'date',
		notSortable: false,
		asc: null,
		desc: null
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
		desc: null
	},
	{
		column: 'shipmentId',
		label: 'Shipment ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'orderId',
		label: 'Order ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'investigatorId',
		label: 'Investigator ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'receivedDate',
		label: 'Received Date',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'status',
		label: 'Kit Status',
		notSortable: true,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'lastModified',
		label: 'Last Modified',
		type: 'date',
		notSortable: false,
		asc: null,
		desc: null
	},
	{
		column: null,
		label: 'View',
		notSortable: true,
		desc: null
	}
];

const siteBusinessRequirements = {
	doseUomIds : ["mL" , "mg"],
	doseTypeOptions: [ "Pill", "Syringe", "Suspension", "Syrup", "Lotion", "Other"],
	quarantineReason: ["Product Damaged","Temperature Excursion","End of Study"]
}

module.exports = {
	kitsStatusesEnum,
	kitsTableHeaders,
	studiesKitsTableHeaders,
	kitsPendingActionEnum,
	kitsMessagesEnum,
	siteBusinessRequirements
};


