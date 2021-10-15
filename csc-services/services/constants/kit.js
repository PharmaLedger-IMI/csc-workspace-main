const kitsStatusesEnum = {
	Received: 'Received',
	AvailableForAssignment: 'AvailableForAssignment',
	Assigned: 'Assigned',
	Dispensed: 'Dispensed',
	Administrated: 'Administrated'
};


// TODO: we need this?
const kitsPendingActionEnum = {
	PendingReviewByCMO: 'Pending Review by CMO',
	SponsorReviewOrApprove: 'Sponsor Review or Approve',
	NoPendingActions: 'There are no any further pending actions',
	PendingShipmentPreparation: 'Pending Shipment Preparation',
	NoFurtherActionsRequired: 'No further actions required'
};

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
		notSortable: false,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'available',
		label: 'Available',
		notSortable: false,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'assigned',
		label: 'Assigned',
		notSortable: false,
		type: 'number',
		asc: null,
		desc: null
	},
	{
		column: 'dispensed',
		label: 'Dispensed',
		notSortable: false,
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
		notSortable: false,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'status',
		label: 'Kit Status',
		notSortable: false,
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

module.exports = {
	kitsStatusesEnum,
	kitsTableHeaders,
	studiesKitsTableHeaders,
	kitsPendingActionEnum,
};