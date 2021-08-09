const { fetch } = require('../utilities');

module.exports = class ProfileService {

	constructor(DSUStorage) {
		// this.storageService = getSharedStorage(DSUStorage);
	}

	getUserDetails(callback) {
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
};
