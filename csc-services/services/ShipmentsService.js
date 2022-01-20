const getSharedStorage = require('./lib/SharedDBStorageService.js').getSharedStorage;
const DSUService = require('./lib/DSUService');
const { Roles, FoldersEnum } = require('./constants');
const { shipmentStatusesEnum, shipmentsEventsEnum} = require('./constants/shipment');
const EncryptionService = require('./lib/EncryptionService.js');
const ProfileService  = require('./lib/ProfileService');

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
		let receiver = ProfileService.getDidData(entity)
		this.communicationService.sendMessage( {
			operation,
			data,
			shortDescription
		},receiver);
	}

	// -> Functions for creation of shipment
	async createShipment(data) {
		const statusModel = { history: [] };
		const statusDSU = await this.saveEntityAsync(statusModel, FoldersEnum.ShipmentsStatuses);
		const status = await this.updateStatusDsu(shipmentStatusesEnum.InPreparation, statusDSU.keySSI);
		const order = await this.getEntityAsync(data.orderSSI, FoldersEnum.Orders);
		const cmoId = await ProfileService.getProfileServiceInstance().getDID()
		const shipmentModel = {

			orderSSI: data.orderSSI,
			requestDate: data.requestDate,
			deliveryDate: data.deliveryDate,
			orderId: data.orderId,
			sponsorId: data.sponsorId,
			cmoId:cmoId,
			siteId:data.siteId,
			shipmentId: data.orderId,
			status: status.history,
			encryptedMessages: {
				kitIdKeySSIEncrypted: order.kitIdKeySSIEncrypted
			}
		};
		const shipmentDSU = await this.saveEntityAsync(shipmentModel);
		const shipmentDBData = { ...shipmentModel, shipmentSSI: shipmentDSU.keySSI, statusSSI: statusDSU.keySSI };
		const shipmentDb = await this.addShipmentToDB(shipmentDBData, shipmentDSU.keySSI);

		this.sendMessageToEntity(
			shipmentDb.sponsorId,
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

		await this.updateEntityAsync(shipmentDB);
		const result = await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);

		let notifyIdentities = [];
		switch (newStatus) {
			case shipmentStatusesEnum.ReadyForDispatch: {
				notifyIdentities.push(shipmentDB.sponsorId);
				notifyIdentities.push(shipmentDB.shipperId);
				break;
			}

			case shipmentStatusesEnum.InTransit: {
				notifyIdentities.push(shipmentDB.sponsorId);
				notifyIdentities.push(shipmentDB.siteId);
				notifyIdentities.push(shipmentDB.cmoId);
				break;
			}

			case shipmentStatusesEnum.ShipmentCancelled: {
				notifyIdentities.push(shipmentDB.cmoId);
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

	async mountAndReceiveTransitShipment(shipmentSSI, transitShipmentSSI, statusKeySSI, role) {
		let transitShipment, shipmentDb, status;
		let shipmentDB;
		if (role === Roles.Site) {
			shipmentDB = await this.mountAndReceiveShipment(shipmentSSI, role, statusKeySSI);
			let kitIdKeySSIEncrypted = shipmentDB.encryptedMessages.kitIdKeySSIEncrypted;
			const kitIdSSI = await EncryptionService.decryptData(kitIdKeySSIEncrypted);
			shipmentDB.kitIdSSI = kitIdSSI;
			await this.mountEntityAsync(kitIdSSI, FoldersEnum.Kits);
		}
		else {
			shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		}
		status = await this.getEntityAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);
		transitShipment = await this.mountEntityAsync(transitShipmentSSI, FoldersEnum.ShipmentTransit);
		shipmentDB.transitShipmentKeySSI = transitShipmentSSI;
		shipmentDB.status = status.history;
		shipmentDB.shipmentId = transitShipment.shipmentId;

		if (role === Roles.CMO) {
			//CMO is the owner of the ShipmentsDSU
			let shipmentDSU = await this.getEntityAsync(shipmentSSI, FoldersEnum.Shipments);
			shipmentDSU.shipmentId = shipmentDB.shipmentId;

			//TODO find a better implementation
			//one approach is to split the shipmentStatuses in more DSUs because CMO stops here and no future shipment statuses should be read
			//the In Transit equivalent for the CMO is Dispatched.
			shipmentDB.status.forEach(shipmentStatus => {
				if (shipmentStatus.status === shipmentStatusesEnum.PickUpAtWarehouse) {
					shipmentStatus.status = shipmentStatusesEnum.Dispatched;
				}
			});
			await this.updateEntityAsync(shipmentDSU, FoldersEnum.Shipments);
		}

		shipmentDb = await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);

		return shipmentDb;
	}

	//update shipmentDB with data from shipmentTransitDSU
	async updateShipmentDB(shipmentKeySSI) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentKeySSI);
		const transitShipment = await this.getEntityAsync(shipmentDB.transitShipmentKeySSI, FoldersEnum.ShipmentTransit);
		shipmentDB = {
			...shipmentDB,
			recipientName: transitShipment.recipientName,
			deliveryDateTime: transitShipment.deliveryDateTime,
			signature: transitShipment.signature
		}
		const status = await this.getEntityAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);
		shipmentDB.status = status.history;
		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);
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
		const status = await this.updateStatusDsu(shipmentStatusesEnum.PickUpAtWarehouse, shipmentDB.statusSSI);
		shipmentDB.transitDSUKeySSI = shipmentTransitDSU.keySSI;
		shipmentDB.status = status.history;
		shipmentDB.shipmentId = shipmentTransitDSU.shipmentId;
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);


		const inTransitDSUMessage = {
			transitShipmentSSI: shipmentTransitDSU.keySSI,
			statusSSI: status.keySSI,
			shipmentSSI: shipmentKeySSI
		}

		this.sendMessageToEntity(
			shipmentDB.sponsorId,
			shipmentStatusesEnum.PickUpAtWarehouse,
			inTransitDSUMessage,
			shipmentStatusesEnum.PickUpAtWarehouse
		);

		//Send a message to cmo
		this.sendMessageToEntity(
			shipmentDB.cmoId,
			shipmentStatusesEnum.Dispatched,
			inTransitDSUMessage,
			shipmentStatusesEnum.Dispatched
		);


	}

	async createAndMountReceivedDSU(shipmentKeySSI, transientDataModel, shipmentComments) {

		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentKeySSI);
		const shipmentReceivedDSU = await this.saveEntityAsync(transientDataModel, FoldersEnum.ShipmentReceived);
		const status = await this.updateStatusDsu(shipmentStatusesEnum.Received, shipmentDB.statusSSI);

		shipmentDB.receivedDSUKeySSI = shipmentReceivedDSU.keySSI;
		shipmentDB.status = status.history;
		shipmentDB.shipmentId = shipmentReceivedDSU.shipmentId;
		shipmentDB.receivedDateTime = shipmentReceivedDSU.receivedDateTime;
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);

		if (shipmentComments) {
			await this.addCommentToDsu(shipmentComments, shipmentDB.shipmentComments);
		}

		const shipmentReceivedDSUMessage = {
			receivedShipmentSSI: shipmentReceivedDSU.keySSI,
			shipmentSSI: shipmentKeySSI
		}

		this.sendMessageToEntity(
			shipmentDB.sponsorId,
			shipmentStatusesEnum.Received,
			shipmentReceivedDSUMessage,
			shipmentStatusesEnum.Received
		);
    const courierMessage = { shipmentSSI: shipmentKeySSI };
		this.sendMessageToEntity(
					shipmentDB.shipperId,
        	shipmentStatusesEnum.ProofOfDelivery,
        	courierMessage,
        	shipmentStatusesEnum.ProofOfDelivery
        );
	}

	//add new data to shipmentTransitDSU and update shipment status
	async updateTransitShipmentDSU(shipmentKeySSI, data, newStatus) {
	    console.log('Data : ', data);
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentKeySSI);

		let shipmentTransitDSU = await this.getEntityAsync(shipmentDB.transitDSUKeySSI, FoldersEnum.ShipmentTransit);
		shipmentTransitDSU = { ...shipmentTransitDSU, ...data };
		await this.updateEntityAsync(shipmentTransitDSU, FoldersEnum.ShipmentTransit);
		const status = await this.updateStatusDsu(newStatus, shipmentDB.statusSSI);
		shipmentDB = { ...shipmentDB, ...data };
		shipmentDB.status = status.history;
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);

		const updatedTransitShipmentDSU = {
			statusSSI: status.keySSI,
			shipmentSSI: shipmentKeySSI
		}

		const notifiableActors = [shipmentDB.sponsorId, shipmentDB.siteId];
		notifiableActors.forEach(actor => {
			this.sendMessageToEntity(
				actor,
				newStatus,
				updatedTransitShipmentDSU,
				newStatus
			);
		})
	}

	async createAndMountShipmentTransitOtherDSUs(shipmentKeySSI, billData, shipmentDocuments, shipmentComments) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentKeySSI);

		let { shipmentTransitBillingDSU, transitDocumentsDSU, transitCommentsDSU } = await this.createShipmentTransitOtherDSUs();

		for (let prop in billData) {
			shipmentTransitBillingDSU[prop] = billData[prop];
		}

		await this.updateEntityAsync(shipmentTransitBillingDSU, FoldersEnum.ShipmentTransitBilling);

		if (shipmentDocuments) {
			transitDocumentsDSU = await this.addDocumentsToDsu(shipmentDocuments, transitDocumentsDSU.keySSI, Roles.Courier);
		}

		if (shipmentComments) {
			transitCommentsDSU = await this.addCommentToDsu(shipmentComments, transitCommentsDSU.keySSI);
		}

		const status = await this.updateStatusDsu(shipmentStatusesEnum.InTransit, shipmentDB.statusSSI);

		shipmentDB.status = status.history;

		shipmentDB.bill = billData;
		shipmentDB.shipmentBilling = shipmentTransitBillingDSU.keySSI;
		shipmentDB.shipmentDocuments = transitDocumentsDSU.keySSI;
		shipmentDB.shipmentComments = transitCommentsDSU.keySSI;

		const siteMessage = {
			transitShipmentSSI: shipmentDB.transitDSUKeySSI,
			statusSSI: status.keySSI,
			shipmentSSI: shipmentKeySSI,
			shipmentComments: shipmentDB.shipmentComments
		};

		this.sendMessageToEntity(
			shipmentDB.siteId,
			shipmentStatusesEnum.InTransit,
			siteMessage,
			shipmentStatusesEnum.InTransit
		);

		const sponsorMessage = {
			shipmentSSI: shipmentKeySSI,
			shipmentBilling: shipmentTransitBillingDSU.keySSI,
			shipmentDocuments: shipmentDB.shipmentDocuments,
			shipmentComments: shipmentDB.shipmentComments
		};

		this.sendMessageToEntity(
			shipmentDB.sponsorId,
			shipmentStatusesEnum.InTransit,
			sponsorMessage,
			shipmentStatusesEnum.InTransit
		);

		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentKeySSI, shipmentDB);
	}


	async addShipmentComment(shipmentSSI, commentData) {

		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		let shipmentComments = await this.getEntityAsync(shipmentDB.shipmentComments, FoldersEnum.ShipmentComments);
		shipmentComments.comments.push(commentData);
		shipmentComments = await this.updateEntityAsync(shipmentComments, FoldersEnum.ShipmentComments);

		const notifiableActors = [shipmentDB.sponsorId, shipmentDB.siteId];
		const inTransitComment = {
			shipmentSSI: shipmentSSI
		}

		notifiableActors.forEach(actor => {
			this.sendMessageToEntity(
				actor,
				shipmentsEventsEnum.InTransitNewComment,
				inTransitComment,
				shipmentsEventsEnum.InTransitNewComment
			);
		})

		return shipmentComments;

	}

	async getShipmentComments(commentsKeySSI) {
		return await this.getEntityAsync(commentsKeySSI, FoldersEnum.ShipmentComments);
	}
	async getShipmentDocuments(documentsKeySSI) {
		return await this.getEntityAsync(documentsKeySSI, FoldersEnum.ShipmentDocuments);
	}

	async getShipmentReceivedDSU(receivedDSUKeySSI) {
		return await this.getEntityAsync(receivedDSUKeySSI, FoldersEnum.ShipmentReceived);
	}

	async createShipmentTransitOtherDSUs() {
		const shipmentTransitBillingDSU = await this.saveEntityAsync(
			{},
			FoldersEnum.ShipmentTransitBilling
		);
		const transitDocumentsDSU = await this.saveEntityAsync(
			{ documents: [] },
			FoldersEnum.ShipmentDocuments
		);
		const transitCommentsDSU = await this.saveEntityAsync(
			{ comments: [] },
			FoldersEnum.ShipmentComments
		);

		return { shipmentTransitBillingDSU, transitDocumentsDSU, transitCommentsDSU };
	}


	async mountShipmentBillingDSU(shipmentSSI, shipmentTransitSSI) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		await this.mountEntityAsync(shipmentTransitSSI, FoldersEnum.ShipmentTransitBilling);
		shipmentDB.shipmentTransitBillingDSU = shipmentTransitSSI;
		shipmentDB.bill = await this.getEntityAsync(shipmentTransitSSI, FoldersEnum.ShipmentTransitBilling);
		const status = await this.getEntityAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);
		shipmentDB.status = status.history;
		// const status = await this.updateStatusDsu(shipmentStatusesEnum.InTransit, shipmentDB.statusSSI);
		// shipmentDB.status = status.history;
		return this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);
	}

	async mountShipmentCommentsDSU(shipmentSSI, shipmentCommentsSSI) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		await this.mountEntityAsync(shipmentCommentsSSI, FoldersEnum.ShipmentComments);
		shipmentDB.shipmentComments = shipmentCommentsSSI;
		return this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);
	}

	async mountShipmentDocumentsDSU(shipmentSSI, shipmentDocumentsSSI) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		await this.mountEntityAsync(shipmentDocumentsSSI, FoldersEnum.ShipmentDocuments);
		shipmentDB.shipmentDocuments = shipmentDocumentsSSI;
		return this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);
	}

	async mountShipmentReceivedDSU(shipmentSSI, receivedShipmentSSI) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		await this.mountEntityAsync(receivedShipmentSSI, FoldersEnum.ShipmentReceived);
		shipmentDB.receivedDSUKeySSI = receivedShipmentSSI;
		const status = await this.getEntityAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);
		shipmentDB.status = status.history;
		return this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);
	}

	async updateShipmentStatus(shipmentSSI, role) {
    	let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
    	const status = await this.getEntityAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);
    	shipmentDB.status = status.history;
    	if (role === Roles.Courier) {
            shipmentDB.status.forEach(shipmentStatus => {
            if (shipmentStatus.status === shipmentStatusesEnum.Received) {
            	shipmentStatus.status = shipmentStatusesEnum.ProofOfDelivery;
            }
            });
        }
    		return this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);
    	}

	async updateLocalShipment(shipmentSSI, newShipmentData = {}) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		const loadedShipmentDSU = await this.getEntityAsync(shipmentDB.shipmentSSI, FoldersEnum.Shipments);
		const status = await this.getEntityAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);

		shipmentDB = {
			...shipmentDB,
			...loadedShipmentDSU,
			...newShipmentData,
			status: status.history
		};

		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentSSI, shipmentDB);
	}

	//TODO to be refactored and extracted in a separete service used also of adding orders comments, documents
	async addDocumentsToDsu(files, keySSI, role) {
		const documentsDsu = await this.getEntityAsync(keySSI, FoldersEnum.ShipmentDocuments);

		const updatedDocumentsDSU = await this.updateEntityAsync(
			{
				...documentsDsu,
				documents: [
					...documentsDsu.documents,
					...files.map((x) => ({
						name: x.name,
						attached_by: role,
						date: new Date().getTime(),
					})),
				],
			},
			FoldersEnum.ShipmentDocuments
		);

		for (const file of files) {
			const attachmentKeySSI = await this.uploadFile(FoldersEnum.ShipmentDocuments + '/' + updatedDocumentsDSU.uid + '/' + 'files' + '/' + file.name, file);
			updatedDocumentsDSU.documents.find((x) => x.name === file.name).attachmentKeySSI = attachmentKeySSI;
		}
		const result = await this.updateEntityAsync(updatedDocumentsDSU, FoldersEnum.ShipmentDocuments);

		return result;
	}
	//TODO to be refactored and extracted in a separete service used also of adding orders comments, documents
	async addCommentToDsu(comments, keySSI) {
		const commentsDsu = await this.getEntityAsync(keySSI, FoldersEnum.ShipmentComments);
		const result = await this.updateEntityAsync(
			{
				...commentsDsu,
				comments: [...commentsDsu.comments, comments],
			},
			FoldersEnum.ShipmentComments
		);
		return result;
	}

	uploadFile(path, file) {
		function getFileContentAsBuffer(file, callback) {
			let fileReader = new FileReader();
			fileReader.onload = function (evt) {
				let arrayBuffer = fileReader.result;
				callback(undefined, arrayBuffer);
			};

			fileReader.readAsArrayBuffer(file);
		}

		return new Promise((resolve, reject) => {
			getFileContentAsBuffer(file, (err, arrayBuffer) => {
				if (err) {
					reject('Could not get file as a Buffer');
				}
				this.DSUStorage.writeFile(path, $$.Buffer.from(arrayBuffer), undefined, (err, keySSI) => {
					if (err) {
						reject(new Error(err));
						return;
					}
					resolve();
				});
			});
		});
	}


}

module.exports = ShipmentsService;
