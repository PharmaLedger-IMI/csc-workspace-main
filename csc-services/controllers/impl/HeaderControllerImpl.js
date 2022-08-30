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

		this.onTagClick("logout",()=>{
			let iframeIdentity;
			if (window.frameElement) {
				iframeIdentity = window.frameElement.getAttribute('identity');

				if (!iframeIdentity) {
					throw new Error("App was not loaded from a wallet loader")
				}

				window.parent.document.dispatchEvent(new CustomEvent(iframeIdentity, {
					detail: {status: "sign-out"}
				}));
			}
		})
	}
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('HeaderController', HeaderControllerImpl);
