const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const viewModelResolver = cscServices.viewModelResolver;

export default class EditShipmentController extends WebcController {

	constructor(...props) {
		super(...props);

		this.attachEventHandlers();
		this.model.wizard = this.getWizardForm();
	}

	attachEventHandlers() {
		this.attachNavigationHandlers();
		this.attachFormActions();
	}

	attachFormActions() {
		this.onTagClick('form:reset', () => {
			this.model.form = viewModelResolver('shipment').form;
		});

		this.onTagClick('form:submit', () => {
			this.send('confirmed', this.model.toObject('form'));
		});
	}

	makeStepActive(stepId, stepHolderId) {
		this.model.wizard.forEach((item) => {
			this.querySelector('#' + item.id).classList.remove('step-active');
			this.hideStep(item.holder_id);
		});

		this.querySelector('#' + stepId).classList.add('step-active');
		this.showStep(stepHolderId);
	}

	attachNavigationHandlers() {
		this.onTagEvent('step-1', 'click', (e) => {
			this.makeStepActive('step-1', 'step-1-wrapper', e);
		});

		this.onTagEvent('step-2', 'click', (e) => {
			this.makeStepActive('step-2', 'step-2-wrapper', e);
		});

		this.onTagEvent('from_step_1_to_2', 'click', (e) => {
			this.makeStepActive('step-2', 'step-2-wrapper', e);
		});
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

	getWizardForm() {
		return [
			{ id: 'step-1', holder_id: 'step-1-wrapper', name: 'Shipment Details', visible: true, validated: false },
			{ id: 'step-2', holder_id: 'step-2-wrapper', name: 'Confirmation' }
		];
	}
}
