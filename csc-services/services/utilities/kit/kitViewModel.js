const constants = require('csc-services').constants;
const orderBusinessRequirements = constants.order.orderBusinessRequirements;
const siteBusinessRequirements = constants.kit.siteBusinessRequirements;
const TEMPERATURE_UNITS = orderBusinessRequirements.TemperatureUnits;
const DAYS_AHEAD = orderBusinessRequirements.DeliveryDateDaysAhead;
const momentService = require('csc-services').momentService;
const doseUomIds = siteBusinessRequirements.doseUomIds;
const doseTypeOptions = siteBusinessRequirements.doseTypeOptions;
const quarantineReasons = siteBusinessRequirements.quarantineReason;

const kitViewModel = {

  form: {
    kitNumber: {
      label: 'Kit Number',
      name: 'kit-number',
      id: 'kit-number',
      required: true,
      placeholder: 'Kit Number',
      disabled: false,
      type: 'text',
      value: ''
    },
    kitId: {
      label: 'Kit ID',
      name: 'kit-id',
      id: 'kit-id',
      required: true,
      placeholder: 'Kit ID',
      disabled: false,
      type: 'text',
      value: ''
    },
    shipmentId: {
      label: 'Shipment ID',
      name: 'shipment-id',
      id: 'shipment-id',
      required: true,
      placeholder: 'Shipment ID',
      disabled: false,
      type: 'text',
      value: ''
    },
    orderId: {
      label: 'Order ID',
      name: 'order-id',
      id: 'order-id',
      required: true,
      placeholder: 'Order ID',
      disabled: false,
      type: 'text',
      value: ''
    },
    studyId: {
      label: 'Study ID',
      name: 'study-id',
      id: 'study-id',
      required: true,
      placeholder: 'Study ID',
      disabled: false,
      type: 'text',
      value: ''
    },
    recipientName: {
      label: 'Recipient Name',
      name: 'recipient-name',
      id: 'recipient-name',
      required: true,
      placeholder: 'Recipient Name',
      disabled: false,
      type: 'text',
      value: ''
    },
    receivedDate: {
      label: 'Shipment Received Date/Time',
      name: 'received_date',
      required: true,
      disabled: false,
      type: 'date',
      value: ''
    },
    receivedTime: {
      name: 'received_time',
      required: true,
      disabled: false,
      type: 'time',
      value: ''
    },
    keep_between_temperature: {
      andLabel: 'and',
      label: 'Keep between (' + TEMPERATURE_UNITS + ')',
      name: 'keep_between_temperature',
      required: true,
      placeholder: '',
      disabled: false,
      value: ''
    },
    keep_between_temperature_min: {
      label: 'Min Temperature',
      name: 'keep_between_temperature_min',
      required: true,
      placeholder: '',
      disabled: false,
      value: ''
    },
    keep_between_temperature_max: {
      label: 'Max Temperature (°C)',
      name: 'keep_between_temperature_max',
      required: true,
      placeholder: '',
      disabled: false,
      value: ''
    },
    temperature_comments: {
      label: 'Temperature Comments',
      name: 'temperature_comments',
      required: true,
      placeholder: 'e.g Do not freeze',
      disabled: false,
      value: ''
    },
    shipment_comment: {
      label: 'Shipment Comment',
      name: 'shipment_comment',
      required: true,
      placeholder: 'Shipment comment',
      disabled: false,
      value: ''
    },
    kit_comment: {
      label: 'Kit Comment',
      name: 'kit_comment',
      required: true,
      placeholder: 'Kit comment',
      disabled: false,
      value: ''
    },
    comments: [],
    add_comment: {
      label: 'Add a Comment',
      name: 'add_comment',
      required: true,
      placeholder: 'Add a comment',
      disabled: false,
      value: ''
    },
    patientId: {
      label: 'Patient ID',
      name: 'patient-id',
      id: 'patient-id',
      required: true,
      placeholder: 'Patient ID',
      disabled: false,
      type: 'text',
      value: ''
    },
    doseType: {
      label: 'Dose Type',
      name: 'dose-type',
      id: 'dose-type',
      required: true,
      placeholder: 'e.g. Syringe',
      disabled: false,
      options: doseTypeOptions,
      value: doseTypeOptions[0],
    },
    doseUom: {
      label: 'Dose UoM',
      name: 'dose-uom',
      id: 'dose-uom',
      required: true,
      placeholder: 'e.g. mL',
      disabled: false,
      options: doseUomIds,
      value: doseUomIds[0],
    },
    doseVolume: {
      label: 'Dose Volume',
      name: 'dose-volume',
      id: 'dose-volume',
      required: true,
      placeholder: 'e.g. 10',
      disabled: false,
      step: '0.01',
      value: '',
      min: '0'
    },
    visitId: {
      label: 'Patient Visit ID',
      name: 'visit-id',
      id: 'visit-id',
      required: true,
      placeholder: 'Enter patient visit ID',
      disabled: false,
      value: ''
    },
    dispensingPartyId: {
      label: 'Dispensing Party ID',
      name: 'dispensing-id',
      id: 'dispensing-id',
      required: true,
      placeholder: 'Dispensing Party ID',
      value: ''
    },
    investigatorId: {
      label: 'Investigator ID',
      name: 'investigator-id',
      id: 'investigator-id',
      required: true,
      placeholder: 'Investigator ID',
      type: 'text',
      value: ''
    },
		returnedDate:{
			label: 'Return Date / Time',
			name: 'return-date',
			id: 'return-date',
			required: true,
			type: 'text',
			value: ''
		},
    quarantineReason:{
      label: 'Quarantine Reason',
      name: 'quarantine-reason',
      id: 'quarantine-reason',
      options: quarantineReasons,
      value: quarantineReasons[0],
    },

    certificationOfDestruction: {
      label: 'Upload File',
      listFiles: false,
      filesAppend: false,
      files: [],
      name: 'No File',
      ids: [],
      error: '',
    },
    destructionFacilityProvider:{
      label: 'Destruction Facility',
      name: 'destruction-facility',
      id: 'destruction-facility',
      options: ["Sponsor","CMO"],
      value: "CMO",
    },
    responsiblePerson:{
      label: 'Responsible Person ID',
      name: 'responsible-person',
      id: 'responsible-person',
      required: true,
      placeholder: 'ID of the responsible person for destruction',
      type: 'text',
      value: ''
    },
    dateOfDestruction:{
      label: 'Date of Destruction',
      name: 'date-of-destruction',
      required: true,
      disabled: false,
      type: 'date',
      max: momentService(new Date()).format(constants.Commons.YearMonthDayPattern),
      value: ''
    },
    destructionComment:{
      label: 'Destruction Comment',
      name: 'destruction-comment',
      id: 'destruction-comment',
      required: true,
      placeholder: 'Provide some details regarding kit destruction',
      type: 'text',
      value: ''
    }
  }

};

module.exports = kitViewModel;
