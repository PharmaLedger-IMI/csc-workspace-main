const orderStatusesEnum = {
	Initiated: 'Initiated',
	ReviewedByCMO: 'Reviewed by CMO',
	Approved: 'Approved',
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
	sites: [{
		name: "Site ID 1",
		siteRegionID: "001",
		siteCountry: "Greece"
	}, {
		name: "Site ID 2",
		siteRegionID: "002",
		siteCountry: "Italy"
	}, {
		name: "Site ID 3",
		siteRegionID: "003",
		siteCountry: "Germany"
	}],
	cmos : [{
		name: "ID 1"
	}, {
		name: "ID 2"
	}, {
		name: "ID 3"
	}],
	sponsorId:"did:spo:123456789abcdefghi#Novartis"
}

module.exports = {
	orderStatusesEnum,
	orderTableHeaders,
	orderPendingActionEnum,
	orderBusinessRequirements
};
