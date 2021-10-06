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

const kitsDummyData = [
	{
		kitId: 1,
		shipmentId: 1,
		orderId: 1,
		investigatorId: 1,
		receivedDate: "2021-06-01T17:21:00.000Z",
		status: [{status: kitsStatusesEnum.Received, date: "2021-06-01T17:21:00.000Z"}],
		lastModified: "2021-06-01T19:21:00.000Z"
	},
	{
		kitId: 2,
		shipmentId: 2,
		orderId: 2,
		investigatorId: 2,
		receivedDate: "2021-07-01T17:21:00.000Z",
		status: [{status: kitsStatusesEnum.Administrated, date: "2021-06-01T17:21:00.000Z"}],
		lastModified: "2021-07-01T19:21:00.000Z"
	},
	{
		kitId: 3,
		shipmentId: 3,
		orderId: 3,
		investigatorId: 3,
		receivedDate: "2021-08-01T17:21:00.000Z",
		status: [{status: kitsStatusesEnum.Assigned, date: "2021-06-01T17:21:00.000Z"}],
		lastModified: "2021-08-01T19:21:00.000Z"
	},
	{
		kitId: 4,
		shipmentId: 4,
		orderId: 4,
		investigatorId: 4,
		receivedDate: "2021-09-01T17:21:00.000Z",
		status: [{status: kitsStatusesEnum.Administrated, date: "2021-06-01T17:21:00.000Z"}],
		lastModified: "2021-09-01T19:21:00.000Z"
	},
	{
		kitId: 5,
		shipmentId: 5,
		orderId: 5,
		investigatorId: 5,
		receivedDate: "2021-10-01T17:21:00.000Z",
		status: [{status: kitsStatusesEnum.Dispensed, date: "2021-06-01T17:21:00.000Z"}],
		lastModified: "2021-10-01T19:21:00.000Z"
	},
	{
		kitId: 6,
		shipmentId: 6,
		orderId: 6,
		investigatorId: 6,
		receivedDate: "2021-11-01T17:21:00.000Z",
		status: [{status: kitsStatusesEnum.Assigned, date: "2021-06-01T17:21:00.000Z"}],
		lastModified: "2021-11-01T19:21:00.000Z"
	},
	{
		kitId: 7,
		shipmentId: 7,
		orderId: 7,
		investigatorId: 7,
		receivedDate: "2021-12-03T19:21:00.000Z",
		status:[ {status: kitsStatusesEnum.Received, date: "2021-06-01T17:21:00.000Z"}],
		lastModified: "2021-12-03T19:21:00.000Z"
	},
];

module.exports = {
	kitsStatusesEnum,
	kitsTableHeaders,
	kitsPendingActionEnum,
	kitsDummyData
};