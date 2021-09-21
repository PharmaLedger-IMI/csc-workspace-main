const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService');
const { Roles, FoldersEnum } = require('./constants');
const { shipmentStatusesEnum } = require('./constants/shipment');
const { orderStatusesEnum } = require('./constants/order');
const CommunicationService = require('./lib/CommunicationService.js');

class ShipmentsService extends DSUService {
	SHIPMENTS_TABLE = 'shipments';

	constructor(DSUStorage, communicationService) {
		super(DSUStorage, '/shipments');
		if (communicationService) {
			this.communicationService = communicationService;
		}
		this.storageService = getSharedStorage(DSUStorage);
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
		return result ? result : [];
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
			requestDate: data.requestDate,
			orderId: data.orderId,
			sponsorId: data.sponsorId,
			shipmentId: data.orderId,
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

		return shipmentDb;
	}

	async updateShipment(shipmentKeySSI, newStatus, newShipmentData) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentKeySSI);
		const status = await this.updateStatusDsu(newStatus, shipmentDB.statusSSI);
		shipmentDB = {
			...shipmentDB,
			...newShipmentData,
			status: status.history
		};

		const shipmentPreparationDSU = await this.updateEntityAsync(shipmentDB);
		const result = await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);

		let notifyIdentities = [];
		switch (newStatus) {
			case shipmentStatusesEnum.ReadyForDispatch: {
				notifyIdentities.push(CommunicationService.identities.CSC.SPONSOR_IDENTITY);
				notifyIdentities.push(CommunicationService.identities.CSC.COU_IDENTITY);
				break;
			}

			case shipmentStatusesEnum.InTransit: {
				notifyIdentities.push(CommunicationService.identities.CSC.SPONSOR_IDENTITY);
				notifyIdentities.push(CommunicationService.identities.CSC.SITE_IDENTITY);
				notifyIdentities.push(CommunicationService.identities.CSC.CMO_IDENTITY);
				break;
			}

			case shipmentStatusesEnum.ShipmentCancelled: {
				notifyIdentities.push(CommunicationService.identities.CSC.CMO_IDENTITY);
				notifyIdentities.push(CommunicationService.identities.CSC.COU_IDENTITY);
				break;
			}
		}

		const notificationData = {
			shipmentSSI: shipmentKeySSI,
			statusSSI: shipmentDB.statusSSI
		};
		notifyIdentities.forEach(identity => {
			this.sendMessageToEntity(identity, newStatus, notificationData, newStatus);
		});

		return result;
	}

	// -> Functions for mounting newly created shipment in other actors except cmo
	async mountAndReceiveShipment(shipmentSSI, role, statusKeySSI) {
		let shipment, shipmentDb, status;
		switch (role) {
			case Roles.Sponsor:
			case Roles.Site:
			case Roles.Courier:
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

	async mountAndReceiveTransitShipment(shipmentSSI, transitShipmentSSI, role) {
		let transitShipment, shipmentDb, status;

		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		status = await this.getEntityAsync(shipmentDB.statusSSI,FoldersEnum.ShipmentsStatuses);
		transitShipment = await this.mountEntityAsync(transitShipmentSSI, FoldersEnum.ShipmentTransit);
		shipmentDB.transitShipmentKeySSI = transitShipmentSSI;
		shipmentDB.status =	status.history;
		shipmentDB.shipmentId = transitShipment.shipmentId;

		shipmentDb = await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);

		if (role === Roles.CMO) {
			//CMO is the owner of the ShipmentsDSU
			let shipmentDSU = await this.getEntityAsync(shipmentSSI,FoldersEnum.Shipments);
			shipmentDSU.shipmentId = shipmentDB.shipmentId;
			await this.updateEntityAsync(shipmentDSU, FoldersEnum.Shipments);
		}
		return shipmentDb;
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

	async createAndMountTransitDSU(shipmentKeySSI, transientDataModel) {

		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentKeySSI);

		const shipmentTransitDSU = await this.saveEntityAsync(transientDataModel, FoldersEnum.ShipmentTransit);
		const status = await this.updateStatusDsu(shipmentStatusesEnum.InTransit, shipmentDB.statusSSI);
		shipmentDB.transitDSUKeySSI = shipmentTransitDSU.keySSI;
		shipmentDB.status = status.history;
		shipmentDB.shipmentId = shipmentTransitDSU.shipmentId;
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);


		const inTransitDSUMessage = {
			transitShipmentSSI: shipmentTransitDSU.keySSI,
			shipmentSSI: shipmentKeySSI
		}

		const notifiableActors = [CommunicationService.identities.CSC.SPONSOR_IDENTITY, CommunicationService.identities.CSC.CMO_IDENTITY, CommunicationService.identities.CSC.SITE_IDENTITY];
		notifiableActors.forEach(actor=>{
			this.sendMessageToEntity(
				actor,
				shipmentStatusesEnum.InTransit,
				inTransitDSUMessage,
				shipmentStatusesEnum.InTransit
			);
		})

	}

	/** not used yet **/
	async updateShipmentNew(shipmentKeySSI, data) {

		const { shipmentTransitBillingDsu, shipmentTransitDsu } = await this.createShipmentOtherDSUs();
		const shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentKeySSI);

		if (data.masterWayBillN && data.hsCode) {
			const shipmentTransitBilling = await this.updateShipmentTransitBillingDsu(data.masterWayBillN, data.hsCode, shipmentTransitBillingDsu.uid);
			shipmentDB.shipmentTransitBilling = shipmentTransitBilling.billings;
		  }

		if (data.recipientName && data.deliveryDateTime && data.shipmentId) {
			const shipmentTransit = await this.updateShipmentTransitDsu(data.recipientName, data.deliveryDateTime, data.shipmentId, shipmentTransitDsu.uid);
			shipmentDB.shipmentTransit = shipmentTransit.transits;
		  }

		const result = await this.addShipmentToDB(shipmentDB, shipmentKeySSI);

		return result;
	}

	async createShipmentOtherDSUs() {
		const shipmentTransitBillingDsu = await this.saveEntityAsync(
			{
				billings: [],
			},
			FoldersEnum.ShipmentTransitBilling
		);
		const shipmentTransitDsu = await this.saveEntityAsync(
			{
				transits: [],
			},
			FoldersEnum.ShipmentTransit
		);

		return { shipmentTransitBillingDsu, shipmentTransitDsu };
	}

	async updateShipmentTransitBillingDsu(masterWayBillN, hsCode, keySSI) {
		const shipmentTransitBillingDsu = await this.getEntityAsync(keySSI, FoldersEnum.ShipmentTransitBilling);
		const result = await this.updateEntityAsync(
		  {
			...shipmentTransitBillingDsu,
			masterWayBillN: [...shipmentTransitBillingDsu.masterWayBillN, masterWayBillN],
			hsCode: [...shipmentTransitBillingDsu.hsCode, hsCode],
		  },
		  FoldersEnum.ShipmentTransitBilling
		);
		return result;
	  }

	  async updateShipmentTransitDsu(recipientName, deliveryDateTime, shipmentId, keySSI) {
		const shipmentTransitDsu = await this.getEntityAsync(keySSI, FoldersEnum.ShipmentTransit);
		const result = await this.updateEntityAsync(
		  {
			...shipmentTransitDsu,
			recipientName: [...shipmentTransitDsu.recipientName, recipientName],
			deliveryDateTime: [...shipmentTransitDsu.deliveryDateTime, deliveryDateTime],
			shipmentId: [...shipmentTransitDsu.shipmentId, shipmentId],
		  },
		  FoldersEnum.ShipmentTransit
		);
		return result;
	  }

	async updateLocalShipment(shipmentSSI) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		const loadedShipmentDSU = await this.getEntityAsync(shipmentDB.shipmentSSI, FoldersEnum.Shipments);
		const status = await this.getEntityAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);

		shipmentDB = {
			...shipmentDB,
			...loadedShipmentDSU,
			status: status.history
		};
		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);
	}
}

module.exports = ShipmentsService;