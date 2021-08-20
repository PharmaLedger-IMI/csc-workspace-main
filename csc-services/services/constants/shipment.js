const shipmentStatusesEnum = {
    InPreparation: 'Shipment In Preparation',
    ReadyForDispatch: 'Shipment Ready For Dispatch',
    InTransit: 'Shipment In Transit',
};

const shipmentTableHeaders = [
    {
        column: 'orderId',
        label: 'Order ID',
        notSortable: false,
        type: 'string',
        asc: null,
        desc: null,
    },
    {
        column: 'shipperID',
        label: 'Shipper ID',
        notSortable: false,
        type: 'string',
        asc: null,
        desc: null,
    },
    {
        column: 'origin',
        label: 'Origin',
        notSortable: false,
        type: 'string',
        asc: null,
        desc: null,
    },
    {
        column: 'type',
        label: 'Type',
        notSortable: false,
        type: 'string',
        asc: null,
        desc: null,
    },
    {
        column: 'requestDeliveryDate',
        label: 'Requested Delivery Date/Time',
        notSortable: false,
        type: 'date',
        asc: null,
        desc: null,
    },
    {
        column: 'schedulePickupDate',
        label: 'Schedule Pickup Date/Time',
        notSortable: false,
        type: 'date',
        asc: null,
        desc: null,
    },
    {
        column: 'status',
        label: 'Shipment Status',
        notSortable: false,
        type: 'string',
        asc: null,
        desc: null,
    },
    {
        column: 'lastModified',
        label: 'Last Modified',
        type: 'date',
        notSortable: false,
        asc: null,
        desc: null,
    },
    {
        column: null,
        label: 'View',
        notSortable: true,
        desc: null,
    },
];

module.exports = {shipmentStatusesEnum, shipmentTableHeaders}