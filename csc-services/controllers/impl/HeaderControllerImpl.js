const { WebcController } = WebCardinal.controllers;

const cscServices = require('csc-services');
const { getProfileServiceInstance } = cscServices.ProfileService;

class HeaderControllerImpl extends WebcController {
	constructor(role, ...props) {
		super(...props);

		this.model = {
			logoURL: 'resources/images/pl_logo.png',
			appName: role.toUpperCase(),
			userName: ''
		};

		this.profileService = getProfileServiceInstance();
		this.profileService.getUserDetails((err, userDetails) => {
			if (err) {
				return console.log('[UserDetails] [ERROR]', err);
			}

			this.model.userName = userDetails.username;

			this.profileService.getDID().then((did)=>{
				this.model.did = did;
			})

		});
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('HeaderController', HeaderControllerImpl);