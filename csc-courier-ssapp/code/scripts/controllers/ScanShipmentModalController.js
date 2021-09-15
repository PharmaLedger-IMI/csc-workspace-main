// MyModalController.js
const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;
const { shipment } = cscServices.constants;


class ScanShipmentModalController extends WebcController {

  constructor(...props) {
    super(...props);

    this.model = this.getReviewOrderViewModel(shipment);


    this.on("toggle-scanner", () => {
      this.model.isScannerActive = !this.model.isScannerActive;
      this.model.scannedData = '';
    });

    this.initStepperNavigationHandlers();
  }

  initStepperNavigationHandlers() {
    this.onTagEvent('step-1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('step-2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('step-3', 'click', (e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagEvent('from_step_1_to_2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('from_step_2_to_1', 'click', (e) => {
      this.makeStepActive('step-1', 'step-1-wrapper', e);
    });

    this.onTagEvent('from_step_2_to_3', 'click', (e) => {
      this.makeStepActive('step-3', 'step-3-wrapper', e);
    });

    this.onTagEvent('from_step_3_to_2', 'click', (e) => {
      this.makeStepActive('step-2', 'step-2-wrapper', e);
    });

    this.onTagEvent('sign_button', 'click', (e) => {
      this.sign();
    });

    this.model.onChange("scannedData", () => {

      let correctValue = 'test';

      if(this.model.scannedData === correctValue){
        this.model.scanSuccess = true;
        this.model.scanError = false;
      }else{
        this.model.scanSuccess = false;
        this.model.scanError = true;
      }

      console.log(this.model.scannedData);

    });

  }

  getDateTime() {
    return this.model.form.inputs.shipment_date.value + ' ' + this.model.form.inputs.shipment_time.value;
  }

  sign(){

    let payload = {
      shipmentId : this.model.form.inputs.shipmentId.value,
      shipperId : this.model.form.inputs.shipperId.value,
      shipment_date : this.model.form.inputs.shipment_date.value,
      shipment_time : this.model.form.inputs.shipment_time.value,
      specialInstructions : this.model.form.inputs.specialInstructions.value,
      typeShipment : this.model.form.inputs.typeShipment.value,
      dimensionHeight : this.model.form.inputs.dimensionHeight.value,
      dimensionWidth : this.model.form.inputs.dimensionWidth.value,
      dimensionLength : this.model.form.inputs.dimensionLength.value,
      origin : this.model.form.inputs.origin.value,
      shippingConditions : this.model.form.inputs.shippingConditions.value,
    }

    console.log(payload);
  }
  getModel() {
    return {
      isScannerActive: false,
      scannedData: ''
    }
  }

  makeStepActive(step_id, step_holder_id, e) {
    if (e) {
      e.wizard_form.forEach((item) => {
        let element = document.getElementById(item.id);
        element.classList.remove('step-active');
        this.hideStep(item.holder_id);
      });

      document.getElementById(step_id).classList.add('step-active');
      this.showStep(step_holder_id);
    }
  }

  hideStep(item) {
    const el = document.getElementById(item);
    if (el) {
      el.classList.add('step-hidden');
    }
  }

  showStep(item) {
    const el = document.getElementById(item);
    if (el) {
      el.classList.remove('step-hidden');
    }
  }

  getReviewOrderViewModel() {
    let model = {
      wizard_form: [
        { id: 'step-1', holder_id: 'step-1-wrapper', name: 'Scan Shipment', visible: true, validated: false },
        { id: 'step-2', holder_id: 'step-2-wrapper', name: 'Add Details', visible: false, validated: false, },
        { id: 'step-3', holder_id: 'step-3-wrapper', name: 'Sign', visible: false, validated: false },
      ],
      wizard_form_navigation: [
        { id: 'from_step_1_to_2', name: 'Next', visible: true, validated: false },
        { id: 'from_step_2_to_1', name: 'Previous', visible: true, validated: false },
        { id: 'from_step_2_to_3', name: 'Next', visible: true, validated: false },
        { id: 'from_step_3_to_2', name: 'Previous', visible: true, validated: false },
      ],
      form: {
        inputs: {
          shipmentId: {
            label: 'Shipment ID',
            name: 'shipmentId',
            required: true,
            placeholder: 'Shipment ID...',
            disabled:false,
            value: '',
          },
          shipperId: {
            label: 'Shipper ID',
            name: 'shipperId',
            required: true,
            placeholder: 'Shipper ID...',
            disabled:false,
            value: '',
          },
          shipment_date: {
            label: 'Shipment Date/Time',
            name: 'shipment_date',
            required: true,
            disabled: false,
            value: '',
          },
          shipment_time: {
            name: 'shipment_time',
            required: true,
            disabled: false,
            value: '',
          },
          specialInstructions: {
            label: 'Special Instructions',
            name: 'specialInstructions',
            required: true,
            placeholder: 'e.g You should do this...',
            disabled:false,
            value: '',
          },
          typeShipment: {
            label: 'Shipment Type',
            name: 'typeShipment',
            required: true,
            placeholder: 'e.g air',
            disabled:false,
            value: '',
          },
          dimensionHeight: {
            label: 'Height',
            name: 'dimensionHeight',
            required: true,
            placeholder: 'Fill in the height.',
            disabled:false,
            value: '',
          },
          dimensionWidth: {
            label: 'Width',
            name: 'dimensionWidth',
            required: true,
            placeholder: 'Fill in the width.',
            disabled:false,
            value: '',
          },
          dimensionLength: {
            label: 'Length',
            name: 'dimensionLength',
            required: true,
            placeholder: 'Fill in the length.',
            disabled:false,
            value: '',
          },
          origin: {
            label: 'Origin',
            name: 'origin',
            required: true,
            placeholder: 'Fill in the origin.',
            disabled:false,
            value: '',
          },
          shippingConditions: {
            label: 'Shipping Conditions',
            name: 'shippingConditions',
            required: true,
            placeholder: 'The condition of the shipping.',
            disabled:false,
            value: '',
          },
          scheduledPickupDate: {
            label: 'Scheduled Pickup Date',
            name: 'scheduledPickupDate',
            required: true,
            placeholder: 'The date of the scheduled pickup.',
            disabled:false,
            value: '',
          },
          scheduledPickupTime: {
            label: 'Scheduled Pickup Time',
            name: 'scheduledPickupTime',
            required: true,
            placeholder: 'The time of the scheduled pickup.',
            disabled:false,
            value: '',
          },
          signature: {
            label: 'Signature',
            name: 'signature',
            required: true,
            placeholder: 'Signature',
            disabled:false,
            value: '',
          },
        }
      },
      isScannerActive: true,
      scannedData: '',
      scanSuccess: false,
      scanError: false
    };

    return model;
  }



}

export default ScanShipmentModalController;
