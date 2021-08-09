const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const ProfileService = cscServices.ProfileService;

export default class HeaderController extends WebcController {
	constructor(...props) {
		super(...props);

		this.model = {
			logoURL: 'resources/images/pl_logo.png',
			appName: 'CMO',
			userName: ''
		};

		this.profileService = new ProfileService(this.DSUStorage);
		this.profileService.getUserDetails((err, userDetails) => {
			if (err) {
				return console.log('[UserDetails] [ERROR]', err);
			}

			this.model.userName = userDetails.username;
		});
	}
}
