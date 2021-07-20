const opendsu = require('opendsu');
const w3cDID = opendsu.loadAPI('w3cdid');

const DEMO_IDENTITIES = {
  CSC: {
    domain: 'csc',
    apps: {
      SPONSOR_IDENTITY: 'sponsorIdentity',
      SITE_IDENTITY: 'siteIdentity',
      CMO_IDENTITY: 'cmoIdentity',
      COU_IDENTITY: 'couIdentity',
    },
  },
};

class CommunicationService {
  DEFAULT_FORMAT_IDENTIFIER = 'did';
  DEMO_METHOD_NAME = 'demo';

  senderIdentity = null;
  listenerIsActive = false;

  constructor(identity) {
    this._validateIdentity(identity);
    this.senderIdentity = identity;
    w3cDID.createIdentity(this.DEMO_METHOD_NAME, identity.did, (err, didDocument) => {
      if (err) {
        throw err;
      }
      this.didDocument = didDocument;
      console.log(`Identity ${didDocument.getIdentifier()} created successfully.`);
    });
  }

  /**
   * @param destinationIdentity => Object
   * Object structure example: { did: 'sponsorIdentifier', domain: 'iot' }
   * @param message => Object
   * Represents the message that you want to send to @destinationIdentity
   */
  sendMessage(destinationIdentity, message) {
    this._validateIdentity(destinationIdentity);
    this.didDocument.setDomain(destinationIdentity.domain);
    let toSentObject = {
      ...this.senderIdentity,
      message: message,
    };
    const recipientIdentity = this._getIdentityConsideringDemoMode(destinationIdentity.did);
    this.didDocument.sendMessage(JSON.stringify(toSentObject), recipientIdentity, (err) => {
      if (err) {
        if (
          err.debug_message === 'Failed to send message' &&
          destinationIdentity.domain !== this.senderIdentity.domain
        ) {
          return console.log(destinationIdentity, ' was not initialized.');
        }
        throw err;
      }
      console.log(this.senderIdentity, ' sent a message to ', destinationIdentity);
    });
  }

  readMessage(callback) {
    this.listenerIsActive = true;
    this.didDocument.readMessage((err, msg) => {
      this.listenerIsActive = false;
      if (err) {
        return callback(err);
      }
      console.log(this.senderIdentity, ` received message: ${msg}`);
      callback(err, msg);
    });
  }

  listenForMessages(domain, callback) {
    if (this.listenerIsActive) {
      return;
    }
    if (typeof domain === 'function') {
      callback = domain;
      domain = this.senderIdentity.domain;
    }
    this._listenMessagesFromDomain(domain, callback);
  }

  /**
   * EXPERIMENTAL FUNCTION
   * @param callback
   */
  listenForMessagesOnAllDomains(callback) {
    let waitTime = 0;
    for (let workspace in DEMO_IDENTITIES) {
      let domain = DEMO_IDENTITIES[workspace].domain;
      setTimeout(() => this._listenMessagesFromDomain(domain, callback), waitTime++ * 1000);
    }
  }

  _listenMessagesFromDomain(domain, callback) {
    this.didDocument.setDomain(domain);
    this.readMessage((err, msg) => {
      callback(err, msg);
      this._listenMessagesFromDomain(domain, callback);
    });
  }

  _validateIdentity(identity) {
    if (typeof identity !== 'object' || identity.did === undefined || identity.domain === undefined) {
      throw Error('Invalid identity details format.');
    }
  }

  _getIdentityConsideringDemoMode = (identifier) => {
    for (let workspace in DEMO_IDENTITIES) {
      let apps = DEMO_IDENTITIES[workspace].apps;
      for (let appName in apps) {
        if (apps[appName] === identifier) {
          return this.DEFAULT_FORMAT_IDENTIFIER + ':' + this.DEMO_METHOD_NAME + ':' + identifier;
        }
      }
    }
    return identifier;
  };
}

let instance = null;

const getInstance = (identity) => {
  if (instance === null) {
    instance = new CommunicationService(identity);
  }
  return instance;
};
let toBeReturnedObject = {
  getInstance,
  identities: {},
};

Object.keys(DEMO_IDENTITIES).forEach((workspaceKey) => {
  let workspace = DEMO_IDENTITIES[workspaceKey];
  Object.keys(workspace.apps).forEach((app) => {
    if (!toBeReturnedObject.identities[workspaceKey]) {
      toBeReturnedObject.identities[workspaceKey] = {};
    }
    toBeReturnedObject.identities[workspaceKey][app] = {
      did: workspace.apps[app],
      domain: workspace.domain,
    };
  });
});

module.exports = toBeReturnedObject;
