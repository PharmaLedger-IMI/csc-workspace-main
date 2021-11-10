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

const shipmentsEventsEnum = {
	InTransitNewComment:"In Transit New Comment"
}

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
		desc: null,
		value: 'orderId'
	},
	{
		column: 'shipperID',
		label: 'Shipper ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'shipperId'
	},
	{
		column: 'origin',
		label: 'Origin',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'origin'
	},
	{
		column: 'type',
		label: 'Type',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'type'
	},
	{
		column: 'requestDeliveryDate',
		label: 'Requested Delivery Date/Time',
		notSortable: false,
		type: 'date',
		asc: null,
		desc: null,
		value: 'deliveryDate'
	},
	{
		column: 'schedulePickupDate',
		label: 'Schedule Pickup Date/Time',
		notSortable: false,
		type: 'date',
		asc: null,
		desc: null,
		value: 'scheduledPickupDate'
	},
	{
		column: 'status',
		label: 'Shipment Status',
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

const shipmentSiteTableHeaders = [
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
		column: 'shipperID',
		label: 'Shipper ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'shipperId'
	},
	{
		column: 'origin',
		label: 'Origin',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'origin'
	},
	{
		column: 'type',
		label: 'Type',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'type'
	},
	{
		column: 'recipientName',
		label: 'Recipient Name',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'recipientName'
	},
	{
		column: 'requestDeliveryDate',
		label: 'Requested Delivery Date/Time',
		notSortable: false,
		type: 'date',
		asc: null,
		desc: null,
		value: 'deliveryDate'
	},
	{
		column: 'status',
		label: 'Shipment Status',
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

const shipmentSponsorTableHeaders = [
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
		column: 'shipperID',
		label: 'Shipper ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'shipperId'
	},
	{
		column: 'origin',
		label: 'Origin',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'origin'
	},
	{
		column: 'type',
		label: 'Type',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'type'
	},
	{
		column: 'recipientName',
		label: 'Recipient Name',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'recipientName'
	},
	{
		column: 'requestDeliveryDate',
		label: 'Requested Delivery Date/Time',
		notSortable: false,
		type: 'date',
		asc: null,
		desc: null,
		value: 'deliveryDate'
	},
	{
		column: 'schedulePickupDate',
		label: 'Schedule Pickup Date/Time',
		notSortable: false,
		type: 'date',
		asc: null,
		desc: null,
		value: 'scheduledPickupDate'
	},
	{
		column: 'status',
		label: 'Shipment Status',
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


const shipmentCourierTableHeaders = [
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
		column: 'shipmentId',
		label: 'Shipment ID',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'shipmentId'
	},
	{
		column: 'origin',
		label: 'Origin',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'origin'
	},
	{
		column: 'type',
		label: 'Type',
		notSortable: false,
		type: 'string',
		asc: null,
		desc: null,
		value: 'type'
	},
	{
		column: 'schedulePickupDate',
		label: 'Scheduled Pickup Date/Time',
		notSortable: false,
		type: 'date',
		asc: null,
		desc: null,
		value: 'scheduledPickupDate'
	},
	{
		column: 'status',
		label: 'Shipment Status',
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

const shipmentBusinessRequirements = {
	shippers : [{
		name: "Shipper ID 1"
	}, {
		name: "Shipper ID 2"
	}, {
		name: "Shipper ID 3"
	}],
	dimensionUnit: "M"
}

module.exports = {
	shipmentStatusesEnum,
	shipmentsEventsEnum,
	shipmentCMOTableHeaders,
	shipmentSiteTableHeaders,
	shipmentSponsorTableHeaders,
	shipmentCourierTableHeaders,
	shipmentPendingActionEnum,
	shipmentBusinessRequirements
};
