const opendsu = require("opendsu");
const scAPI = opendsu.loadAPI("sc");
class DidService {

	constructor() {
		this.did = null;
	}

	getUserDetails(callback) {
		const { fetch } = require('../utilities');
		fetch('/api-standard/user-details')
			.then((response) => response.json())
			.then((userDetails) => {
				callback(null, userDetails);
			})
			.catch((err) => {
				console.log(`Failed to load user-details`, err);
				callback(err);
			});
	}

	async getWalletDomain() {
		const opendsu = require("opendsu");
		const config = opendsu.loadAPI("config");
			let domain = await $$.promisify(config.getEnv)("domain");
			if (!domain) {
				throw new Error("No domain was set up in the environment configuration file.")
			}
			return domain;
	}

	async getDID(){
		return new Promise((resolve, reject) => {
			if(this.did){
				return resolve(this.did);
			}

			const resolveDid = () => {
				this.getUserDetails(async (err, userDetails) => {
					if (err) {
						return reject(err);
					}

					const domain = await this.getWalletDomain();
					const did = `did:ssi:name:${domain}:${userDetails.username}`;
					this.did = did;
					resolve(did);
				});
			};

			const sc = scAPI.getSecurityContext();

			if (sc.isInitialised()) {
				resolveDid();
			} else {
				sc.on('initialised', resolveDid);
			}
		});
	}

	static getDidData(didString){
		const splitDid = didString.split(":");
		return {
			didType: `${splitDid[1]}:${splitDid[2]}`,
			publicName: splitDid[4],
			domain:splitDid[3]
		};
	}
}


let instance = null;
const getDidServiceInstance = () => {
	if (instance === null) {
		instance = new DidService();
	}
	return instance;
};

module.exports = {
	getDidServiceInstance,
	getDidData:DidService.getDidData
};
