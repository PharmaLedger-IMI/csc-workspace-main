const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService');
const { Roles, FoldersEnum } = require('./constants');
const { shipmentStatusesEnum } = require('./constants/shipment');
const NotificationsService = require('./lib/NotificationService.js');
const CommunicationService = require('./lib/CommunicationService.js');

class ShipmentsService extends DSUService {
	SHIPMENTS_TABLE = 'shipments';

	constructor(DSUStorage, communicationService) {
		super(DSUStorage, '/shipments');
		if (communicationService) {
			this.communicationService = communicationService;
		}
		this.storageService = getSharedStorage(DSUStorage);
		this.notificationsService = new NotificationsService(DSUStorage);
		this.DSUStorage = DSUStorage;
	}

	async addShipmentToDB(data, key) {
		return await this.storageService.insertRecord(this.SHIPMENTS_TABLE, key ? key : data.shipmentId, data);
	}

	async getShipment(keySSI) {
		return await this.storageService.getRecord(this.SHIPMENTS_TABLE, keySSI);
	}

	async getShipments() {
		const result = await this.storageService.filter(this.SHIPMENTS_TABLE);
		if (result) {
			return result.filter((x) => !x.deleted);
		} else return [];
	}

	sendMessageToEntity(entity, operation, data, shortDescription) {
		this.communicationService.sendMessage(entity, {
			operation,
			data,
			shortDescription
		});
	}

	// -> Functions for creation of shipment
	async createShipment(data) {
		const statusModel = { history: [] };
		const statusDSU = await this.saveEntityAsync(statusModel, FoldersEnum.ShipmentsStatuses);
		const status = await this.updateStatusDsu(shipmentStatusesEnum.InPreparation, statusDSU.keySSI);

		const shipmentModel = {
			orderSSI: data.orderSSI,
			status: status.history
		};
		const shipmentDSU = await this.saveEntityAsync(shipmentModel);
		const shipmentDBData = { ...shipmentModel, shipmentSSI: shipmentDSU.keySSI, statusSSI: statusDSU.keySSI };
		const shipmentDb = await this.addShipmentToDB(shipmentDBData, shipmentDSU.keySSI);

		this.sendMessageToEntity(
			CommunicationService.identities.CSC.SPONSOR_IDENTITY,
			shipmentStatusesEnum.InPreparation,
			{
				shipmentSSI: shipmentDSU.keySSI,
				statusSSI: statusDSU.keySSI
			},
			shipmentStatusesEnum.InPreparation
		);

		this.sendMessageToEntity(
			CommunicationService.identities.CSC.SITE_IDENTITY,
			shipmentStatusesEnum.InPreparation,
			{
				shipmentSSI: shipmentDSU.keySSI,
				statusSSI: statusDSU.keySSI
			},
			shipmentStatusesEnum.InPreparation
		);

		return shipmentDb;
	}

	async updateShipment(shipmentKeySSI, newShipmentData, newStatus, role) {
		debugger;
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentKeySSI);
		const status = await this.updateStatusDsu(newStatus, shipmentDB.statusSSI);
		shipmentDB = {
			...shipmentDB,
			...newShipmentData,
			status: status.history
		};
		const result = await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);

		const notifyIdentities = [
			CommunicationService.identities.CSC.SPONSOR_IDENTITY,
			CommunicationService.identities.CSC.SITE_IDENTITY
		];
		switch (newStatus) {
			case shipmentStatusesEnum.ReadyForDispatch: {
				notifyIdentities.push(CommunicationService.identities.CSC.COU_IDENTITY);
				break;
			}
		}

		notifyIdentities.forEach(identity => {
			this.sendMessageToEntity(
				identity,
				newStatus,
				{
					shipmentSSI: shipmentKeySSI,
					statusSSI: shipmentDB.statusSSI
				},
				newStatus
			);
		});

		return result;
	}

	// -> Functions for mounting newly created shipment in other actors except cmo
	async mountAndReceiveShipment(shipmentSSI, role, statusKeySSI) {
		let shipment, shipmentDb, status;
		switch (role) {
			case Roles.Sponsor:
				shipment = await this.mountEntityAsync(shipmentSSI, FoldersEnum.Shipments);
				status = await this.mountEntityAsync(statusKeySSI, FoldersEnum.ShipmentsStatuses);

				shipmentDb = await this.addShipmentToDB(
					{
						...shipment,
						shipmentSSI: shipment.uid,
						status: status.history,
						statusSSI: status.uid
					},
					shipment.uid
				);

				return shipmentDb;
			case Roles.Site:
				shipment = await this.mountEntityAsync(shipmentSSI, FoldersEnum.Shipments);
				status = await this.mountEntityAsync(statusKeySSI, FoldersEnum.ShipmentsStatuses);

				shipmentDb = await this.addShipmentToDB(
					{
						...shipment,
						shipmentSSI: shipment.uid,
						status: status.history,
						statusSSI: status.uid
					},
					shipment.uid
				);

				return shipmentDb;
		}
	}

	async updateStatusDsu(newStatus, keySSI) {
		const statusDsu = await this.getEntityAsync(keySSI, FoldersEnum.ShipmentsStatuses);
		const result = await this.updateEntityAsync(
			{
				...statusDsu,
				history: [...statusDsu.history, { status: newStatus, date: new Date().getTime() }]
			},
			FoldersEnum.ShipmentsStatuses
		);
		return result;
	}
}

module.exports = ShipmentsService;