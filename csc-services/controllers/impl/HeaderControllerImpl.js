const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const { getDidServiceInstance } = cscServices.DidService;

class HeaderControllerImpl extends WebcController {
	constructor(role, ...props) {
		super(...props);

		this.model = {
			logoURL: 'themes/blue-csc-theme/images/pl_logo.png',
			appName: role.toUpperCase(),
			userName: ''
		};

		let didService = getDidServiceInstance();
		didService.getUserDetails((err, userDetails) => {
			if (err) {
				return console.log('[UserDetails] [ERROR]', err);
			}

			this.model.userName = userDetails.username;

		});
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('HeaderController', HeaderControllerImpl);
