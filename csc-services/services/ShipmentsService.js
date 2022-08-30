const DSUService = require('./lib/DSUService');
const { Roles, FoldersEnum,Commons } = require('./constants');
const { shipmentStatusesEnum,shipmentsEventsEnum} = require('./constants/shipment');
const {getCommunicationServiceInstance} = require("./lib/CommunicationService");
const momentService  = require('./lib/moment.min');
const DidService  = require('./lib/DidService');
const JWTService  = require('./lib/JWTService');

class ShipmentsService extends DSUService {
	SHIPMENTS_TABLE = 'shipments';

	constructor() {
		super(FoldersEnum.Shipments);
		this.communicationService = getCommunicationServiceInstance();
		this.JWTService = new JWTService();
	}

	async addShipmentToDB(data, key) {
		return await this.storageService.insertRecord(this.SHIPMENTS_TABLE, key, data);
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

		try{
			this.storageService.beginBatch();
		}
		catch (e){
			console.log(e);
		}
		const statusModel = { history: [{ status: shipmentStatusesEnum.InPreparation, date: new Date().getTime() }] };
		const statusDSU = await this.saveEntityAsync(statusModel, FoldersEnum.ShipmentsStatuses);
		const order = await this.getEntityAsync(data.orderSSI, FoldersEnum.Orders);
		const cmoId = await DidService.getDidServiceInstance().getDID();
		const shipmentModel = {

			orderSSI: data.orderSSI,
			requestDate: data.requestDate,
			requestedDeliveryDateTime: data.deliveryDate,
			orderId: data.orderId,
			sponsorId: data.sponsorId,
			cmoId:cmoId,
			siteId:data.siteId,
			siteRegionId:data.siteRegionId,
			siteCountry:data.siteCountry,
			shipmentId: data.orderId,
			studyId:data.studyId,
			temperatures:data.temperatures,
			temperature_comments:data.temperature_comments,
			status: statusDSU.history,
			kitIdJWTVerifiablePresentation: order.kitIdJWTVerifiablePresentation
		};
		const shipmentDSU = await this.saveEntityAsync(shipmentModel);
		const shipmentDBData = {
			...shipmentModel,
			shipmentSSI: shipmentDSU.keySSI,
			shipmentSReadSSI:shipmentDSU.sReadSSI,
			statusSSI: statusDSU.keySSI
		};
		const shipmentDb = await this.addShipmentToDB(shipmentDBData, shipmentDSU.uid);

		await this.storageService.commitBatch();
		this.sendMessageToEntity(
			shipmentDb.sponsorId,
			shipmentStatusesEnum.InPreparation,
			{
				shipmentSSI: shipmentDSU.sReadSSI,
				statusSSI: statusDSU.keySSI
			},
			shipmentStatusesEnum.InPreparation
		);

		return shipmentDb;
	}

	async updateShipment(shipmentUid, newStatus, newShipmentData) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentUid);
		const status = await this.updateStatusDsu(newStatus, shipmentDB.statusSSI);
		shipmentDB = {
			...shipmentDB,
			...newShipmentData,
			status: status.history
		};
    let shipmentDSU = await this.getEntityAsync(shipmentUid,FoldersEnum.Shipments);

		//head-up: only cmo should be able to add additionalData
		if(newShipmentData){
			shipmentDSU = {...shipmentDSU, ...newShipmentData};
			await this.updateEntityAsync(shipmentDSU, FoldersEnum.Shipments);
		}

		const result = await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentUid, shipmentDB);

		let notifyIdentities = [];
		switch (newStatus) {
			case shipmentStatusesEnum.ReadyForDispatch: {
				notifyIdentities.push(shipmentDB.sponsorId);
				notifyIdentities.push(shipmentDB.courierId);
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
			shipmentSSI: shipmentDB.shipmentSReadSSI ? shipmentDB.shipmentSReadSSI : shipmentDB.shipmentSSI,
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
						shipmentSSI: shipmentSSI,
						status: status.history,
						statusSSI: statusKeySSI
					},
					shipment.uid
				);
				return shipmentDb;
		}
	}

	async mountAndReceiveTransitShipment(shipmentIdentifier, transitShipmentSSI, statusKeySSI, role) {
		let transitShipment, shipmentDb, status;
		let shipmentDB;
		if (role === Roles.Site) {
			shipmentDB = await this.mountAndReceiveShipment(shipmentIdentifier, role, statusKeySSI);
			const { kitsIdsSReadSSI } = await this.JWTService.validateKitsIdsPresentation(shipmentDB.kitIdJWTVerifiablePresentation);
			shipmentDB.kitIdSSI = kitsIdsSReadSSI;
			await this.mountEntityAsync(kitsIdsSReadSSI, FoldersEnum.KitIds);
		}
		else {
			shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
		}
		const statusUid = await this.getEntityPathAsync(shipmentDB.statusSSI,FoldersEnum.ShipmentsStatuses);
		status = await this.getEntityAsync(statusUid, FoldersEnum.ShipmentsStatuses);
		transitShipment = await this.mountEntityAsync(transitShipmentSSI, FoldersEnum.ShipmentTransit);
		shipmentDB.transitShipmentIdentifier = transitShipment.uid;
		shipmentDB.status = status.history;
		shipmentDB.shipmentId = transitShipment.shipmentId;
		shipmentDB.temperatureLoggerId = transitShipment.temperatureLoggerId;

		if (role === Roles.CMO) {
			//CMO is the owner of the ShipmentsDSU
			let shipmentDSU = await this.getEntityAsync(shipmentIdentifier, FoldersEnum.Shipments);
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

		shipmentDb = await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentDB.uid, shipmentDB);

		return shipmentDb;
	}

	//update shipmentDB with data from shipmentTransitDSU
	async updateShipmentDB(shipmentUUID) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentUUID);
		const transitShipment = await this.getEntityAsync(shipmentDB.transitShipmentIdentifier, FoldersEnum.ShipmentTransit);
		console.log("transitShipment.shipmentJWTVerifiablePresentation", transitShipment.shipmentJWTVerifiablePresentation);
		if (transitShipment.shipmentJWTVerifiablePresentation) {
			const envData = {
				atDate: new Date().getTime(),
				credentialPublicClaims: {
					shipmentIdentifier: shipmentUUID,
					shipmentPickupAtWarehouseSigned: true,
					shipmentDeliveredSigned: true
				},
				rootsOfTrust: [shipmentDB.courierId]
			};
			const validationResult = await this.JWTService.validateShipmentPresentation(transitShipment.shipmentJWTVerifiablePresentation, envData);
			console.log('validationResult result', validationResult);
		}
		shipmentDB = {
			...shipmentDB,
			recipientName: transitShipment.recipientName,
			deliveryDateTime: transitShipment.deliveryDateTime
		}
		const statusIdentifier = await this.getEntityPathAsync(shipmentDB.statusSSI,FoldersEnum.ShipmentsStatuses);
		const status = await this.getEntityAsync(statusIdentifier, FoldersEnum.ShipmentsStatuses);
		shipmentDB.status = status.history;
		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentUUID, shipmentDB);
	}

	async updateStatusDsu(newStatus, knownIdentifier) {

		const uid = await this.getEntityPathAsync(knownIdentifier,FoldersEnum.ShipmentsStatuses);

		const statusDsu = await this.getEntityAsync(uid, FoldersEnum.ShipmentsStatuses);
		const result = await this.updateEntityAsync(
			{
				...statusDsu,
				history: [...statusDsu.history, { status: newStatus, date: new Date().getTime() }]
			},
			FoldersEnum.ShipmentsStatuses
		);
		return result;
	}

	async createAndMountTransitDSU(shipmentUid, transientDataModel) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentUid);
		transientDataModel.shipmentJWTVerifiableCredential = await this.JWTService
			.createShipmentVerifiableCredential(shipmentDB.courierId, shipmentDB.siteId, {
				shipmentIdentifier: shipmentUid,
				shipmentPickupAtWarehouseSigned: true
			});

		const shipmentTransitDSU = await this.saveEntityAsync(transientDataModel, FoldersEnum.ShipmentTransit);
		const status = await this.updateStatusDsu(shipmentStatusesEnum.PickUpAtWarehouse, shipmentDB.statusSSI);
		shipmentDB.transitDSUKeySSI = shipmentTransitDSU.keySSI;
		shipmentDB.transitDSUUid =  shipmentTransitDSU.uid;
		shipmentDB.shipmentId = transientDataModel.shipmentId;
		shipmentDB.temperatureLoggerId = transientDataModel.temperatureLoggerId;
		shipmentDB.status = status.history;
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentUid, shipmentDB);

		const inTransitDSUMessage = {
			transitShipmentSSI: shipmentTransitDSU.sReadSSI,
			statusSSI: status.keySSI,
			shipmentSSI: shipmentUid
		}

		this.sendMessageToEntity(
			shipmentDB.sponsorId,
			shipmentStatusesEnum.PickUpAtWarehouse,
			inTransitDSUMessage,
			shipmentStatusesEnum.PickUpAtWarehouse
		);

		this.sendMessageToEntity(
			shipmentDB.cmoId,
			shipmentStatusesEnum.Dispatched,
			inTransitDSUMessage,
			shipmentStatusesEnum.Dispatched
		);
	}

	async createAndMountReceivedDSU(shipmentIdentifier, transientDataModel, shipmentComments) {

		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
		transientDataModel.shipmentReceivedJWTVerifiablePresentation = await this.JWTService
			.createShipmentReceivedPresentation(shipmentDB.siteId, shipmentDB.courierId, { shipmentReceivedSigned: true });
		const shipmentReceivedDSU = await this.saveEntityAsync(transientDataModel, FoldersEnum.ShipmentReceived);
		const status = await this.updateStatusDsu(shipmentStatusesEnum.Received, shipmentDB.statusSSI);

		shipmentDB.receivedDSUKeySSI = shipmentReceivedDSU.keySSI;
		shipmentDB.status = status.history;
		shipmentDB.shipmentId = shipmentReceivedDSU.shipmentId;
		shipmentDB.receivedDateTime = shipmentReceivedDSU.receivedDateTime;
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentIdentifier, shipmentDB);

		if (shipmentComments) {
			await this.addCommentToDsu(shipmentComments, shipmentDB.shipmentComments);
		}

		const shipmentReceivedDSUMessage = {
			receivedShipmentSSI: shipmentReceivedDSU.sReadSSI,
			shipmentSSI: shipmentIdentifier
		}

		this.sendMessageToEntity(
			shipmentDB.sponsorId,
			shipmentStatusesEnum.Received,
			shipmentReceivedDSUMessage,
			shipmentStatusesEnum.Received
		);
    const courierMessage = { shipmentSSI: shipmentIdentifier };
		this.sendMessageToEntity(
					shipmentDB.courierId,
        	shipmentStatusesEnum.ProofOfDelivery,
        	courierMessage,
        	shipmentStatusesEnum.ProofOfDelivery
        );
	}

	//add new data to shipmentTransitDSU and update shipment status
	async updateTransitShipmentDSU(shipmentIdentifier, data, newStatus) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
		let shipmentTransitDSU = await this.getEntityAsync(shipmentDB.transitDSUUid, FoldersEnum.ShipmentTransit);
		const shipmentJWTVerifiableCredential = await this.JWTService
			.updateShipmentVerifiableCredential(shipmentTransitDSU.shipmentJWTVerifiableCredential, { shipmentDeliveredSigned: true });
		data.shipmentJWTVerifiablePresentation = await this.JWTService
			.createShipmentPresentation(shipmentJWTVerifiableCredential, shipmentDB.courierId);

		shipmentTransitDSU = { ...shipmentTransitDSU, ...data };
		await this.updateEntityAsync(shipmentTransitDSU, FoldersEnum.ShipmentTransit);
		const status = await this.updateStatusDsu(newStatus, shipmentDB.statusSSI);
		shipmentDB = { ...shipmentDB, ...data };
		shipmentDB.status = status.history;
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentDB.uid, shipmentDB);

		const updatedTransitShipmentDSU = {
			//send the anchorId while the recipients already has the status mounted
			statusSSI: status.uid,
			shipmentSSI: shipmentIdentifier
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

	async createAndMountShipmentTransitOtherDSUs(shipmentUid, billData, shipmentDocuments, shipmentComments) {
		this.storageService.beginBatch();
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentUid);

		let { shipmentTransitBillingDSU, transitDocumentsDSU, transitCommentsDSU } = await this.createShipmentTransitOtherDSUs(billData, shipmentDocuments, shipmentComments);

		for (let prop in billData) {
			shipmentTransitBillingDSU[prop] = billData[prop];
		}
		shipmentTransitBillingDSU.shipmentBillingJWTVerifiablePresentation = await this.JWTService
			.createShipmentBillingPresentationForSponsor(shipmentDB.courierId, shipmentDB.sponsorId, billData);

		shipmentDB.bill = billData;
		shipmentDB.shipmentBilling = shipmentTransitBillingDSU.uid;
		shipmentDB.shipmentDocuments = transitDocumentsDSU.uid;
		shipmentDB.shipmentComments = transitCommentsDSU.uid;

		const status = await this.updateStatusDsu(shipmentStatusesEnum.InTransit, shipmentDB.statusSSI);

		shipmentDB.status = status.history;
		const dbRecord = await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentUid, shipmentDB);
		await this.storageService.commitBatch();

		const siteMessage = {
			transitShipmentSSI: shipmentDB.transitDSUKeySSI,
			statusSSI: shipmentDB.statusSSI,
			shipmentSSI: shipmentDB.shipmentSSI,
			shipmentComments: transitCommentsDSU.keySSI
		};

		this.sendMessageToEntity(
			shipmentDB.siteId,
			shipmentStatusesEnum.InTransit,
			siteMessage,
			shipmentStatusesEnum.InTransit
		);

		const sponsorMessage = {
			shipmentSSI: shipmentUid,
			shipmentBilling: shipmentTransitBillingDSU.sReadSSI,
			shipmentDocuments: transitDocumentsDSU.sReadSSI,
			shipmentComments: transitCommentsDSU.sReadSSI
		};

		this.sendMessageToEntity(
			shipmentDB.sponsorId,
			shipmentStatusesEnum.InTransit,
			sponsorMessage,
			shipmentStatusesEnum.InTransit
		);

		return dbRecord;
	}


	async reportWrongDeliveryAddress(shipmentSSI, commentData) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		let shipmentComments = await this.getEntityAsync(shipmentDB.shipmentComments, FoldersEnum.ShipmentComments);
		shipmentComments.comments.push(commentData);
		shipmentComments = await this.updateEntityAsync(shipmentComments, FoldersEnum.ShipmentComments);

		const status = await this.updateStatusDsu(shipmentStatusesEnum.WrongDeliveryAddress, shipmentDB.statusSSI);
		shipmentDB.status = status.history;

		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentDB.uid, shipmentDB);

		const notifiableActors = [shipmentDB.sponsorId, shipmentDB.siteId];
		const wrongDeliveryAddressComment = {
			shipmentSSI: shipmentSSI
		}

		notifiableActors.forEach(actor => {
			this.sendMessageToEntity(
				actor,
				shipmentStatusesEnum.WrongDeliveryAddress,
				wrongDeliveryAddressComment,
				shipmentStatusesEnum.WrongDeliveryAddress
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
		const receivedDSUIdentifier  = await this.getEntityPathAsync(receivedDSUKeySSI,FoldersEnum.ShipmentReceived);
		return await this.getEntityAsync(receivedDSUIdentifier, FoldersEnum.ShipmentReceived);
	}

	async createShipmentTransitOtherDSUs(billData, shipmentDocuments,shipmentComment ) {
		const shipmentTransitBillingDSU = await this.saveEntityAsync(
			billData,
			FoldersEnum.ShipmentTransitBilling
		);

		if(!shipmentDocuments){
			shipmentDocuments = [];
		}

		const documents = shipmentDocuments.map(doc => {
			return {
				name: doc.name,
				attached_by: Roles.Courier,
				date: new Date().getTime()
			};
		});

		const transitDocumentsDSU = await this.saveEntityAsync(
			{ documents: documents },
			FoldersEnum.ShipmentDocuments
		);

		for (const file of shipmentDocuments) {
				 await this.uploadFile(FoldersEnum.ShipmentDocuments + '/' + transitDocumentsDSU.uid + '/' + 'files' + '/' + file.name, file);
		}

		const transitCommentsDSU = await this.saveEntityAsync(
			{ comments: [shipmentComment] },
			FoldersEnum.ShipmentComments
		);

		return { shipmentTransitBillingDSU, transitDocumentsDSU, transitCommentsDSU };
	}


	async mountShipmentBillingDSU(shipmentSSI, shipmentTransitSSI) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		const shipmentTransitDSU = await this.mountEntityAsync(shipmentTransitSSI, FoldersEnum.ShipmentTransitBilling);
		shipmentDB.shipmentTransitBillingDSU = shipmentTransitDSU.uid;
		shipmentDB.bill = await this.getEntityAsync(shipmentDB.shipmentTransitBillingDSU, FoldersEnum.ShipmentTransitBilling);

		console.log('billing data:', shipmentDB.bill);
		const envData = {
			atDate: new Date().getTime(),
			credentialPublicClaims: shipmentDB.bill
		};
		const validationResult = await this.JWTService.validateShipmentBillingPresentation(shipmentTransitDSU.shipmentBillingJWTVerifiablePresentation, envData);
		console.log('[shipmentTransitBillingDSU]', validationResult);

		const statusIdentifier = await this.getEntityPathAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);
		const status = await this.getEntityAsync(statusIdentifier, FoldersEnum.ShipmentsStatuses);
		shipmentDB.status = status.history;
		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentDB.uid, shipmentDB);
	}

	async mountShipmentCommentsDSU(shipmentSSI, shipmentCommentsSSI) {
		const shipmentIdentifier = await this.getEntityPathAsync(shipmentSSI,FoldersEnum.Shipments);
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
		const shipmentsCommentsDsu = await this.mountEntityAsync(shipmentCommentsSSI, FoldersEnum.ShipmentComments);
		shipmentDB.shipmentComments = shipmentsCommentsDsu.uid;
		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentDB.uid, shipmentDB);
	}

	async mountShipmentDocumentsDSU(shipmentSSI, shipmentDocumentsSSI) {
		const shipmentIdentifier = await this.getEntityPathAsync(shipmentSSI,FoldersEnum.Shipments);
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
		const shipmentDocuments = await this.mountEntityAsync(shipmentDocumentsSSI, FoldersEnum.ShipmentDocuments);
		shipmentDB.shipmentDocuments = shipmentDocuments.uid;
		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentDB.uid, shipmentDB);
	}

	async mountShipmentReceivedDSU(shipmentSSI, receivedShipmentSSI) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentSSI);
		const receivedShipmentDsu = await this.mountEntityAsync(receivedShipmentSSI, FoldersEnum.ShipmentReceived);
		//TODO refactor this to use proper property name for receivedShipmentDSu uid. use identifier instead of receivedDSUKeySSI
		shipmentDB.receivedDSUKeySSI = receivedShipmentDsu.uid;

		const envData = {
			adDate: new Date().getTime(),
			credentialPublicClaims: {
				shipmentReceivedSigned: true
			},
			rootsOfTrust: [shipmentDB.siteId]
		};
		const validationResult = await this.JWTService.validateShipmentReceivedPresentation(receivedShipmentDsu.shipmentReceivedJWTVerifiablePresentation, envData);
		console.log("[shipmentReceivedSigned] validationResult", validationResult);

		const statusIdentifier = await this.getEntityPathAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);
		const status = await this.getEntityAsync(statusIdentifier, FoldersEnum.ShipmentsStatuses);
		shipmentDB.status = status.history;
		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentDB.uid, shipmentDB);
	}

	async updateShipmentStatus(shipmentIdentifier, role) {
    	let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
			const statusIdentifier = await this.getEntityPathAsync(shipmentDB.statusSSI,FoldersEnum.ShipmentsStatuses);
    	const status = await this.getEntityAsync(statusIdentifier, FoldersEnum.ShipmentsStatuses);
    	shipmentDB.status = status.history;
    	if (role === Roles.Courier) {
            shipmentDB.status.forEach(shipmentStatus => {
            if (shipmentStatus.status === shipmentStatusesEnum.Received) {
            	shipmentStatus.status = shipmentStatusesEnum.ProofOfDelivery;
            }
            });
        }
    		return this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentIdentifier, shipmentDB);
    	}

	async updateLocalShipment(shipmentIdentifier, newShipmentData = {}) {
		this.storageService.beginBatch();
		shipmentIdentifier = this.getUidFromSSI(shipmentIdentifier);
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
		const loadedShipmentDSU = await this.getEntityAsync(shipmentIdentifier, FoldersEnum.Shipments);


		const statusIdentifier = await this.getEntityPathAsync(shipmentDB.statusSSI, FoldersEnum.ShipmentsStatuses);
		const status = await this.getEntityAsync(statusIdentifier, FoldersEnum.ShipmentsStatuses);

		shipmentDB = {
			...shipmentDB,
			...loadedShipmentDSU,
			...newShipmentData,
			status: status.history
		};

		const shipmentRecord =  await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentIdentifier, shipmentDB);
		await this.storageService.commitBatch();
		return shipmentRecord;
	}

	//TODO to be refactored and extracted in a separate service used also of adding orders comments, documents
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

	async sendNewPickupDetailsRequest(cmoId, pickupDateTimeChangeRequest){
		const shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, pickupDateTimeChangeRequest.shipmentSSI);
		shipmentDB.pickupDateTimeChangeRequest = {
			requestPickupDateTime: pickupDateTimeChangeRequest.requestPickupDateTime,
			reason: pickupDateTimeChangeRequest.reason,
			date: new Date().getTime()
		};
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, pickupDateTimeChangeRequest.shipmentSSI, shipmentDB);
		this.sendMessageToEntity(cmoId, shipmentsEventsEnum.PickupDateTimeChangeRequest, pickupDateTimeChangeRequest, shipmentsEventsEnum.PickupDateTimeChangeRequest);
	}

	async storePickupDateTimeRequest(shipmentIdentifier, pickupDateTimeChangeRequest){
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
		shipmentDB.pickupDateTimeChangeRequest = pickupDateTimeChangeRequest;
		return await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentIdentifier, shipmentDB);
	}

	getTimestampFromDateTime(dateTime) {
		return momentService(dateTime.date + ' ' + dateTime.time).valueOf();
	}


	async acceptNewPickupDateTimeRequest(shipmentIdentifier) {
		let shipmentDB = await this.storageService.getRecord(this.SHIPMENTS_TABLE, shipmentIdentifier);
		let shipmentDSU = await this.getEntityAsync(shipmentIdentifier, FoldersEnum.Shipments);

		const requestedPickupTimestamp = shipmentDB.pickupDateTimeChangeRequest.requestPickupDateTime;
		const scheduledPickupDateTime = this.getTimestampFromDateTime({
			date: momentService(requestedPickupTimestamp).format(Commons.DateFormatPattern),
			time: momentService(requestedPickupTimestamp).format(Commons.HourFormatPattern)
		});



		shipmentDSU.scheduledPickupDateTime = scheduledPickupDateTime;
		shipmentDB.scheduledPickupDateTime = scheduledPickupDateTime;
		shipmentDB.pickupDateTimeChangeRequest = undefined;

		await this.updateEntityAsync(shipmentDSU, FoldersEnum.Shipments);
		await this.storageService.updateRecord(this.SHIPMENTS_TABLE, shipmentIdentifier, shipmentDB);
		const notifiedActors = [shipmentDB.sponsorId, shipmentDB.courierId];
		notifiedActors.forEach((actor) => {
			this.sendMessageToEntity(actor, shipmentsEventsEnum.PickupDateTimeChanged, {
				shipmentSSI: shipmentDB.uid
			}, shipmentsEventsEnum.PickupDateTimeChanged);
		});
	}


	uploadFile(path, file) {
		function getFileContentAsBuffer(file, callback) {
			let fileReader = new FileReader();
			fileReader.onload = function () {
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
