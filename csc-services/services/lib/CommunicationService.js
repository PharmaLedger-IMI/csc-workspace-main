const opendsu = require("opendsu");
const w3cDID = opendsu.loadAPI('w3cdid');
const scAPI = opendsu.loadAPI("sc");
const ProfileService = require("./ProfileService");
const messageQueueServiceInstance = require("./MessageQueueService");

class CommunicationService {

    /**
     * @param didType : String - the type of the did (did:name, did:group...)
     * @param publicName : String - the public name used by the sender to send a message
     */
    constructor() {
        this.domain = "default";
        this.createOrLoadIdentity();
    }

    createOrLoadIdentity() {

        let profileService = ProfileService.getProfileServiceInstance();
        profileService.getDID().then((did)=>{
            const didData = ProfileService.getDidData(did);

            try {
                const sc = scAPI.getSecurityContext();
                sc.on("initialised", async () => {
                    try {
                        this.didDocument = await this.getDidDocumentInstance(didData.didType, didData.publicName);
                        console.log(this.didDocument);
                    }
                    catch (e){
                        debugger;
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

    async getDidDocumentInstance(didType, publicName) {
        try {
            const didDocument = await this.resolveDidDocument(didType, publicName);
            console.log(`Identity ${didDocument.getIdentifier()} loaded successfully.`);
            return didDocument
        } catch (e) {
            console.log(e);
            try {
                const didDocument = await $$.promisify(w3cDID.createIdentity)(didType, this.domain, publicName);
                console.log(`Identity ${didDocument.getIdentifier()} created successfully.`);
                return didDocument;
            } catch (e) {
                console.error(`DID creation failed for didType:'${didType}' , publicName: '${publicName}'`)
                throw e;
            }
        }
    }

    async resolveDidDocument(didType, publicName) {
        try {
            const identifier = `did:${didType}:${this.domain}:${publicName}`;
            return await $$.promisify(w3cDID.resolveDID)(identifier);
        } catch (e) {
            console.error(`DID resolve failed for didType:'${didType}' , publicName: '${publicName}'`)
            throw e;
        }
    }

    async sendMessage(data, receiver) {
        if (!this.didDocument) {
            return this.sleep(async () => {
                await this.sendMessage(data, receiver);
            });
        }

        const {didType, publicName} = receiver;
        try {
            const receiverDidDocument = await this.resolveDidDocument(didType, publicName);
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