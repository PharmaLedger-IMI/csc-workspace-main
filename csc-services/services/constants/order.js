const orderStatusesEnum = {
	Initiated: 'Initiated',
	InProgress: 'In Progress',
	Completed: 'Completed',
	Canceled: 'Canceled'
};

const orderPendingActionEnum = {
	PendingReviewByCMO: 'Pending Review by CMO',
	SponsorReviewOrApprove: 'Sponsor Approve',
	NoPendingActions: 'There are no any further pending actions',
	PendingShipmentPreparation: 'Pending Shipment Preparation',
	NoFurtherActionsRequired: 'No further actions required'
};

const orderTableHeaders = [
	{
		column: 'orderId',
		label: 'Order ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'sponsorId',
		label: 'Sponsor ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'studyId',
		label: 'Study ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'siteId',
		label: 'Site ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'requestDate',
		label: 'Request Date',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'deliveryDate',
		label: 'Requested Delivery Date/Time',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'status',
		label: 'Order Status',
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

const orderBusinessRequirements = {
	DeliveryDateDaysAhead: 2,
	MinTemperature: "-100",
	MaxTemperature: "100",
	TemperatureUnits: "°C",
}

module.exports = {
	orderStatusesEnum,
	orderTableHeaders,
	orderPendingActionEnum,
	orderBusinessRequirements
};
