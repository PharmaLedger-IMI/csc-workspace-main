const opendsu = require("opendsu");
const w3cDID = opendsu.loadAPI('w3cdid');
const scAPI = opendsu.loadAPI("sc");
const DidService = require("./DidService");
const messageQueueServiceInstance = require("./MessageQueueService");

class CommunicationService {

    /**
     * @param didType : String - the type of the did (did:name, did:group...)
     * @param publicName : String - the public name used by the sender to send a message
     */
    constructor() {
        this.createOrLoadIdentity();
    }

    createOrLoadIdentity() {

        let didService = DidService.getDidServiceInstance();
        didService.getDID().then((did)=>{
            const didData = DidService.getDidData(did);

            try {
                const sc = scAPI.getSecurityContext();
                sc.on("initialised", async () => {
                    try {
                        this.didDocument = await this.getDidDocumentInstance(didData);
                        console.log(this.didDocument);
                    }
                    catch (e){
                        console.log(e);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }).catch ((e)=>{
            console.error(e);
        });

    }

    async getDidDocumentInstance(didData) {
        try {
            const didDocument = await this.resolveDidDocument(didData);
            console.log(`Identity ${didDocument.getIdentifier()} loaded successfully.`);
            return didDocument
        } catch (e) {
            try {
                const didDocument = await $$.promisify(w3cDID.createIdentity)(didData.didType, didData.domain, didData.publicName);
                console.log(`Identity ${didDocument.getIdentifier()} created successfully.`);
                return didDocument;
            } catch (e) {
                console.log(`DID creation failed for didType:'${didData.didType}' , publicName: '${didData.publicName}' , domain: '${didData.domain}'`)
                throw e;
            }
        }
    }

    async resolveDidDocument(didData) {
        const {didType, domain, publicName} = didData;
        try {
            const identifier = `did:${didType}:${domain}:${publicName}`;
            return await $$.promisify(w3cDID.resolveDID)(identifier);
        } catch (e) {
            console.log(`DID resolve failed for didType:'${didType}' , publicName: '${publicName}'`)
            throw e;
        }
    }

    async sendMessage(receiverDid, data) {
        if (!this.didDocument) {
            return this.sleep(async () => {
                await this.sendMessage(receiverDid, data);
            });
        }

        let receiverDidData = DidService.getDidData(receiverDid);

        try {
            const receiverDidDocument = await this.resolveDidDocument(receiverDidData);
            //temporary: trust the sender that he is who pretends to be: @senderIdentity
            data = {
                ...data,
                senderIdentity: await DidService.getDidServiceInstance().getDID()
            }
            this.didDocument.sendMessage(JSON.stringify(data), receiverDidDocument, (err) => {
                if (err) {
                    throw err;
                }
            });
        } catch (e) {
            console.log("[ERROR]");
            console.error(e);
        }
    }

    listenForMessages(callback) {
        if (!this.didDocument) {
            return this.sleep(() => {
                this.listenForMessages(callback);
            });
        }

        this.didDocument.readMessage((err, decryptedMessage) => {
            if (err) {
                console.log("[ERROR]");
                console.error(err)
            }
            console.log("[Received Message]", decryptedMessage);
            messageQueueServiceInstance.addCallback(async () => {
                await callback(err, decryptedMessage);
            });

            this.listenForMessages(callback);
        });
    }

    sleep(callback) {
        const time = 500;
        setTimeout(() => {
            callback();
        }, time);
    }
}

let instance = null;
const getCommunicationServiceInstance = () => {
    if (instance === null) {
        instance = new CommunicationService();
    }

    return instance;
};

module.exports = {
    getCommunicationServiceInstance
};