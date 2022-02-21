const shipmentStatusesEnum = {
	InPreparation: 'In Preparation',
	ReadyForDispatch: 'Ready For Dispatch',
	PickUpAtWarehouse: 'Pick-up At Warehouse',
	InTransit: 'In Transit',
	Delivered: 'Delivered',
	Received: 'Received',
	ProofOfDelivery: 'Proof Of Delivery',
	ShipmentCancelled: 'Order & Shipment Cancelled',
	Cancelled: 'Cancelled',
	Dispatched: 'Dispatched'
};
const shipmentPendingActionEnum = {
	PendingReadyForDispatch: 'Pending Ready for Dispatch',
	PendingPickUp: 'Pending Pick-Up',
	PendingInTransit: 'In Transit',
	PendingDelivery: 'Pending Delivery',
	PendingReception: 'Pending Reception',
	ManageKits: 'Manage Kits'
};

const shipmentCMOTableHeaders = [
	{
		column: 'orderId',
		label: 'Order ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'shipperId',
		label: 'Shipper ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'origin',
		label: 'Origin',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'type',
		label: 'Type',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'requestDeliveryDate',
		label: 'Requested Delivery Date/Time',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'schedulePickupDate',
		label: 'Schedule Pickup Date/Time',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'status',
		label: 'Shipment Status',
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

const shipmentSiteTableHeaders = [
	{
		column: 'shipmentId',
		label: 'Shipment ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'shipperId',
		label: 'Shipper ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'origin',
		label: 'Origin',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'type',
		label: 'Type',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'recipientName',
		label: 'Recipient Name',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'requestDeliveryDate',
		label: 'Requested Delivery Date/Time',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'status',
		label: 'Shipment Status',
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

const shipmentSponsorTableHeaders = [
	{
		column: 'shipmentId',
		label: 'Shipment ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'shipperId',
		label: 'Shipper ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'origin',
		label: 'Origin',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'type',
		label: 'Type',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'recipientName',
		label: 'Recipient Name',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'requestDeliveryDate',
		label: 'Requested Delivery Date/Time',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'schedulePickupDate',
		label: 'Schedule Pickup Date/Time',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'status',
		label: 'Shipment Status',
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


const shipmentCourierTableHeaders = [
	{
		column: 'orderId',
		label: 'Order ID',
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
		column: 'origin',
		label: 'Origin',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'type',
		label: 'Type',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null
	},
	{
		column: 'schedulePickupDate',
		label: 'Scheduled Pickup Date/Time',
		notSortable: true,
		type: 'date',
		asc: null,
		desc: null
	},
	{
		column: 'status',
		label: 'Shipment Status',
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

const shipmentBusinessRequirements = {
	dimensionUnit: "M"
}

module.exports = {
	shipmentStatusesEnum,
	shipmentCMOTableHeaders,
	shipmentSiteTableHeaders,
	shipmentSponsorTableHeaders,
	shipmentCourierTableHeaders,
	shipmentPendingActionEnum,
	shipmentBusinessRequirements
};
