wizardRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"../../../fgt-dsu-wizard":[function(require,module,exports){
(function (__dirname){(function (){
/**
 * @module fgt-dsu-wizard
 */

/**
 * iterates through all the commands in the command folder and registers them
 * Is called by the apihub via the server.json
 */
function Init(server){
	const path = require('path');
	const cmdsDir = path.join(__dirname, "commands");
	require('fs').readdir(cmdsDir, (err, files) => {
		if (err)
			throw err;
		files.filter(f => f !== 'setSSI.js' && f !== 'index.js').forEach(f => {
			require(path.join(cmdsDir, f)).command(server);
		});
	});
}

module.exports = {
	Init,
	/**
	 * Exposes constants.
	 */
	Constants: require("./constants"),
	 /**
	 * Exposes the Model module
	 */
	Model: require("./model"),
	/**
	 * exposes the Commands module
	 */
	Commands: require("./commands"),
	/**
	 * instantiates a new DSUService
	 */
	DSUService: new (require('./services').DSUService),
	/**
	 * Exposes the Services Module
	 */
	Services: require("./services"),
	/**
	 * Exposes the Managers module
	 */
	Managers: require("./managers"),
    /**
	 * Exposes Version.
	 */
	Version: require("./version"),
};

}).call(this)}).call(this,"/")

},{"./commands":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\index.js","./constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js","./managers":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\index.js","./model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js","./services":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\index.js","./version":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\version.js","fs":false,"path":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\builds\\tmp\\wizard_intermediar.js":[function(require,module,exports){
(function (global){(function (){
global.wizardLoadModules = function(){ 

	if(typeof $$.__runtimeModules["wizard"] === "undefined"){
		$$.__runtimeModules["wizard"] = require("../../../fgt-dsu-wizard");
	}
};
if (true) {
	wizardLoadModules();
}
global.wizardRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("wizard");
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../../fgt-dsu-wizard":"../../../fgt-dsu-wizard"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\index.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */
module.exports = {
    setSSI: require('../../pdm-dsu-toolkit/commands/setSSI'),
    createParticipantSSI: require("./setParticipantSSI").createParticipantSSI,
    createParticipantConstSSI: require("./setParticipantConstSSI").createParticipantConstSSI,
    createInboxSSI: require("./setInboxSSI").createInboxSSI,
    createOrderingPartnerSSI: require("./setOrderingPartnerSSI").createOrderingPartnerSSI,
    createOrderLineSSI: require("./setOrderLineSSI").createOrderLineSSI,
    createOrderLinesSSI: require("./setOrderLinesSSI").createOrderLinesSSI,
    createOrderSSI: require("./setOrderSSI").createOrderSSI,
    createStatusSSI: require('./setStatusSSI').createStatusSSI,
    createBatchSSI: require("./setBatchSSI").createBatchSSI,
    createProductSSI: require("./setProductSSI").createProductSSI,
    createSendingPartnerSSI: require("./setSendingPartnerSSI").createSendingPartnerSSI,
    createShipmentLineSSI: require("./setShipmentLineSSI").createShipmentLineSSI,
    createShipmentLinesSSI: require("./setShipmentLinesSSI").createShipmentLinesSSI,
    createShipmentSI: require("./setShipmentSSI").createShipmentSSI
}
},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","./setBatchSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setBatchSSI.js","./setInboxSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setInboxSSI.js","./setOrderLineSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderLineSSI.js","./setOrderLinesSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderLinesSSI.js","./setOrderSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderSSI.js","./setOrderingPartnerSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderingPartnerSSI.js","./setParticipantConstSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setParticipantConstSSI.js","./setParticipantSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setParticipantSSI.js","./setProductSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setProductSSI.js","./setSendingPartnerSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setSendingPartnerSSI.js","./setShipmentLineSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setShipmentLineSSI.js","./setShipmentLinesSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setShipmentLinesSSI.js","./setShipmentSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setShipmentSSI.js","./setStatusSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setStatusSSI.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setBatchSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for a batch dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the batch</li>
 *     <li>batch - the batch number</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createBatchSSI(data, domain) {
    console.log("New BATCH_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "batch", createBatchSSI, "setBatchSSI", "traceability");
}

module.exports = {
    command,
    createBatchSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setInboxSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Creates a template seedSSI meant to refer an Inbox DSU type.
 * @param {object} inbox object. There is no fgt-dsu-wizard/model/Inbox.js, but it is +/- specified in the DSU constitution.
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 */
function createInboxSSI(participant, domain) {
    console.log("New Inbox_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    return keyssiSpace.createTemplateSeedSSI(domain);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "inbox", createInboxSSI, "setInboxSSI", "traceability");
}

module.exports = {
    command,
    createInboxSSI: createInboxSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderLineSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for an orderLine dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>orderId - the id of the Order</li>
 *     <li>requesterId - the requesterId</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createOrderLineSSI(data, domain) {
    console.log("New ORDERLINE_SSI in domain ", domain, [data.requesterId, data.orderId, data.gtin]);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.requesterId, data.orderId, data.gtin], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "orderline", createOrderLineSSI, "setOrderLineSSI", "traceability");
}

module.exports = {
    command,
    createOrderLineSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderLinesSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for an orderLines dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createOrderLinesSSI(data, domain) {
    console.log("New ORDERLINES_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, "ORDERLINES"], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "orderlines", createOrderLinesSSI, "setOrderLinesSSI", "traceability");
}

module.exports = {
    command,
    createOrderLinesSSI
}

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for an {@link Order} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>orderId - the id of the Order</li>
 *     <li>requesterId - the requesterId</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createOrderSSI(data, domain) {
    console.log("New ORDER_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.orderId, data.requesterId], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "order", createOrderSSI, "setOrderSSI", "traceability");
}

module.exports = {
    command,
    createOrderSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderingPartnerSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for an orderingPartner dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>requesterId - the requesterId</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createOrderingPartnerSSI(data, domain) {
    console.log("New ORDERING_PARTNER_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.requesterId], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "orderingpartner", createOrderingPartnerSSI, "setOrderingPartnerSSI", "traceability");
}

module.exports = {
    command,
    createOrderingPartnerSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setParticipantConstSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Creates a seedSSI meant to contain participant 'participantConst' data.
 * could be used as an identity
 * @param {Participant} participant. Must have a valid id property.
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 */
function createParticipantConstSSI(participant, domain) {
    console.log("New ParticipantConst_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [participant.id]);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "participantConst", createParticipantConstSSI, "setParticipantConstSSI", "traceability");
}

module.exports = {
    command,
    createParticipantConstSSI: createParticipantConstSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setParticipantSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Creates a seedSSI meant to contain participant 'participant' data.
 * could be used as an identity
 * @param {Participant} participant
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 */
function createParticipantSSI(participant, domain) {
    console.log("New Participant_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    return keyssiSpace.buildTemplateSeedSSI(domain, participant.id + participant.name + participant.tin, undefined, 'v0', undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "participant", createParticipantSSI, "setParticipantSSI", "traceability");
}

module.exports = {
    command,
    createParticipantSSI: createParticipantSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setProductSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for a {@link Product} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createProductSSI(data, domain) {
    console.log("New PRODUCT_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "product", createProductSSI, "setProductSSI", "traceability");
}

module.exports = {
    command,
    createProductSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setSendingPartnerSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for a sendingPartner dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>batch - the batch number</li>
 *     <li>senderId - the senderId</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createSendingPartnerSSI(data, domain) {
    console.log("New SENDING_PARTNER_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch, data.senderId], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "sendingpartner", createSendingPartnerSSI, "setSendingPartnerSSI", "traceability");
}

module.exports = {
    command,
    createSendingPartnerSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setShipmentLineSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for a {@link ShipmentLine} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the {@link Product}</li>
 *     <li>shipmentId - the id of the {@link Shipment}</li>
 *     <li>senderId - the senderId</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createShipmentLineSSI(data, domain) {
    console.log("New SHIPMENTLINE_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.senderId, data.shipmentId, data.gtin], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "shipmentline", createShipmentLineSSI, "setShipmentLineSSI", "traceability");
}

module.exports = {
    command,
    createShipmentLineSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setShipmentLinesSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for a orderLine dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the {@link Product}</li>
 *     <li>batch - the number of the {@link Batch}</li>
 *     <li>requesterId - the requesterId</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createShipmentLinesSSI(data, domain) {
    console.log("New SHIPMENTLINES_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch, "SHIPMENTLINES"], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "shipmentLines", createShipmentLinesSSI, "setShipmentLinesSSI", "traceability");
}

module.exports = {
    command,
    createShipmentLinesSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setShipmentSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for a {@link Shipment} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>senderId - the Id of the Sender</li>
 *     <li>shipmentId - the id of the {@link Shipment}</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createShipmentSSI(data, domain) {
    console.log("New SHIPMENT_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.senderId, data.shipmentId], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "shipment", createShipmentSSI, "setShipmentSSI", "traceability");
}

module.exports = {
    command,
    createShipmentSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setStatusSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for a orderLine dsu
 * @param {OrderStatus|ShipmentStatus} status. if status has the properties:
 * <ul>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {SeedSSI} (template)
 */
function createStatusSSI(status, domain) {
    console.log("New OrderStatus_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (status[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, status[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, status, undefined, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "status", createStatusSSI, "setStatusSSI", "traceability");
}

module.exports = {
    command,
    createStatusSSI
};
},{"../../pdm-dsu-toolkit/commands/setSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js":[function(require,module,exports){
const ANCHORING_DOMAIN = "traceability";
const BATCH_MOUNT_PATH = "/batches";
const INBOX_MOUNT_PATH = '/inbox';
const INBOX_ORDER_LINES_PROP = 'orderLines';
const INBOX_SHIPMENT_LINES_PROP = 'shipmentLines';
const INBOX_RECEIVED_ORDERS_PROP = 'receivedOrders';
const INBOX_RECEIVED_SHIPMENTS_PROP = 'receivedShipments';
const INFO_PATH = require('../pdm-dsu-toolkit/constants').INFO_PATH;
const ISSUED_ORDERS_MOUNT_PATH = "/issuedOrders";
const INBOX_ORDER_LINES_PATH = '/orderLines';
const PARTICIPANT_MOUNT_PATH = require('../pdm-dsu-toolkit/constants').PARTICIPANT_MOUNT_PATH;
const PRODUCT_MOUNT_PATH = "/products";
const PUBLIC_ID_MOUNT_PATH = "/publicId";
const INBOX_RECEIVED_ORDERS_PATH = '/receivedOrders';
const INBOX_RECEIVED_SHIPMENTS_PATH = '/receivedShipments';
const INBOX_SHIPMENT_LINES_PATH = '/shipmentLines';
const STOCK_PATH = '/stock';

// these constants depend on the previous constants
const INBOX_PATHS_AND_PROPS = [
    {path: INBOX_ORDER_LINES_PATH, prop: INBOX_ORDER_LINES_PROP},
    {path: INBOX_SHIPMENT_LINES_PATH, prop: INBOX_SHIPMENT_LINES_PROP},
    {path: INBOX_RECEIVED_ORDERS_PATH, prop: INBOX_RECEIVED_ORDERS_PROP},
    {path: INBOX_RECEIVED_SHIPMENTS_PATH, prop: INBOX_RECEIVED_SHIPMENTS_PROP},
];

module.exports = {
    ANCHORING_DOMAIN,
    BATCH_MOUNT_PATH,
    INBOX_ORDER_LINES_PROP,
    INBOX_MOUNT_PATH,
    INBOX_PATHS_AND_PROPS,
    INBOX_RECEIVED_ORDERS_PROP,
    INBOX_RECEIVED_SHIPMENTS_PROP,
    INBOX_SHIPMENT_LINES_PROP,
    INFO_PATH,
    ISSUED_ORDERS_MOUNT_PATH,
    INBOX_ORDER_LINES_PATH,
    PARTICIPANT_MOUNT_PATH,
    PRODUCT_MOUNT_PATH,
    PUBLIC_ID_MOUNT_PATH,
    INBOX_RECEIVED_ORDERS_PATH,
    INBOX_RECEIVED_SHIPMENTS_PATH,
    INBOX_SHIPMENT_LINES_PATH,
    STOCK_PATH
}
},{"../pdm-dsu-toolkit/constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\constants.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\BatchManager.js":[function(require,module,exports){
const {INFO_PATH, PRODUCT_MOUNT_PATH, BATCH_MOUNT_PATH, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Batch = require('../model').Batch;

/**
 * Batch Manager Class
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Archive} storageDSU the DSU where the storage should happen
 */
class BatchManager extends Manager{
    constructor(storageDSU) {
        super(storageDSU);
        this.productService = new (require('wizard').Services.ProductService)(ANCHORING_DOMAIN);
        this.batchService = new (require('wizard').Services.BatchService)(ANCHORING_DOMAIN);
        this.keyCache = {};
    }

    /**
     * Returns the mount path for a given gtin & batch
     * @private
     */
    _getMountPath(gtin, batchNumber){
        return `${PRODUCT_MOUNT_PATH}/${gtin}${BATCH_MOUNT_PATH}/${batchNumber}`;
    }

    _getProductKey(gtin){
        if (!this.keyCache[gtin])
            this.keyCache[gtin] = this.productService.generateKey(gtin);
        return this.keyCache[gtin];
    }

    _getBatchKey(gtin, batch){
        let key = gtin + '' + batch;
        if (!this.keyCache[key])
            this.keyCache[key] = this.batchService.generateKey(gtin, batch);
        return this.keyCache[key];
    }

    /**
     * Creates a {@link Batch} dsu
     * @param gtin
     * @param {Batch} batch
     * @param {function(err, keySSI, keySSI)} callback first keySSI if for the batch, the second for its' product dsu
     */
    create(gtin, batch, callback) {
        this.batchService.create(gtin, batch, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`Batch ${batch.batchNumber} created for product '${gtin}'`);
            let key = this._getProductKey(gtin);
            super.loadDSU(key, (err, dsu) => {
                if (err)
                    return callback(err);
                let path = `${BATCH_MOUNT_PATH}/${batch.batchNumber}`
                dsu.mount(path, keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Batch ${batch.batchNumber} mounted at '${path}' for product ${gtin}`);
                    callback(undefined, keySSI, key);
                });
            });
        });
    }

    /**
     * reads the specific Batch information from a given gtin (if exists and is registered to the mah)
     *
     * @param {string} gtin
     * @param {string} batchNumber
     * @param {function(err, Batch)} callback
     */
    getOne(gtin, batchNumber, callback){
        this.storage.getObject(this._getMountPath(gtin, batchNumber), (err, batch) => {
            if (err)
                return callback(err);
            callback(undefined, batch);
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string} gtin
     * @param {function(err)} callback
     */
    remove(gtin, callback) {
        let mount_path = this._getMountPath(gtin);
        this.storage.unmount(mount_path, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${gtin} removed from mount point ${mount_path}`);
            callback();
        });
    }

    /**
     *
     * @param model
     * @returns {Batch}
     */
    fromModel(model){
        return new Batch({
            batchNumber: model.batchNumber.value,
            expiry: model.expiry.value,
            serialNumbers: JSON.parse(JSON.stringify(model.serialNumbers.value))
        });
    }

    /**
     * Edits/Overwrites the product details
     * @param {string} gtin
     * @param {string} batchNumber
     * @param {function(err)} callback
     */
    edit(gtin, batchNumber,  callback) {
        super.initialize(() => {
            let mount_path = this._getMountPath(gtin, batchNumber);
            this.storage.writeFile(`${mount_path}${INFO_PATH}`, (err) => {
                if (err)
                    return callback(err);
                console.log(`Product ${gtin} updated`);
                callback();
            });
        });
    }

    getAll(gtin, callback){
        let self = this;
        let key = this._getProductKey(gtin);
        this.loadDSU(key, (err, dsu) => {
           if (err)
               return callback(err);
           dsu.listMountedDSUs(BATCH_MOUNT_PATH, (err, mounts) => {
               if (err)
                   return callback(err);
               mounts = mounts.map(m => {
                   m.batchNumber = m.path;
                   m.path = self._getMountPath(gtin, m.path);
                   return m;
               });
               super.readAll(mounts, callback);
           });
        });
    }
}

let batchManager;
/**
 * @param {Archive} dsu
 * @returns {BatchManager}
 */
const getBatchManager = function (dsu) {
    if (!batchManager)
        batchManager = new BatchManager(dsu);
    return batchManager;
}

module.exports = getBatchManager;

},{"../../pdm-dsu-toolkit/managers/Manager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\Manager.js","../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js","wizard":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\OrderManager.js":[function(require,module,exports){
const { INFO_PATH, ISSUED_ORDERS_MOUNT_PATH: ISSUED_ORDERS_MOUNT_PATH, ANCHORING_DOMAIN } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Order = require('../model').Order;
const OrderLine = require('../model').OrderLine;
const OrderStatus = require('../model').OrderStatus;
/**
 * Order Manager Class
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Archive} storageDSU the DSU where the storage (mounting) should happen
 */
class OrderManager extends Manager {
    constructor(storageDSU) {
        super(storageDSU);
        this.productService = new (require('../services').OrderService)(ANCHORING_DOMAIN);
    }

    /**
     * Returns the mount path for a given orderId
     * @private
     */
    _getMountPath(orderId) {
        // jpsl technical protest: I disagree with Tiago in coding the mount path here. See create().
        return `${ISSUED_ORDERS_MOUNT_PATH}/${orderId}`;
    }

    /**
     * Creates a {@link Order} dsu
     * @param {Order} order
     * @param {function(err, keySSI, mountPath)} callback where the string is the mount path relative to the main DSU
     */
    create(order, callback) {
        let self = this;
        self.productService.create(order, (err, keySSI) => {
            if (err)
                return callback(err);
            // jpsl technical protest: I disagree with Tiago in coding the mount here.
            // The creation code would be here, but I would write the mount inside ParticipantMager.
            // Having the OrderManager changing mounts inside the Participant DSU violates
            // the encapsulation principle.
            // Tis means that the caller would have to call a ParticipantManager.createOrder(...)
            // nethod (which does not exist). This would also affects all CRUD operations on Order.
            // But Tiago is the architect, so we write things his way.
            let mountPath = this._getMountPath(order.orderId);
            self.storage.mount(mountPath, keySSI.getIdentifier(), (err) => {
                if (err)
                    return callback(err);
                console.log(`Order ${order.orderId} created and mounted at '${mountPath}'`);
                callback(undefined, keySSI, mountPath);
            });
        });
    }

    /**
    * Edits/Overwrites the product details
    * @param {string} order
    * @param {function(err)} callback
    */
    edit(order, callback) {
        let self = this;
        let mount_path = this._getMountPath(order.orderId);
        self.storage.writeFile(`${mount_path}${INFO_PATH}`, order, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${order} updated`);
            callback();
        });
    }

    /**
     * Convert the OrderController view model into an Order.
     * @param model
     * @returns {Order}
     */
     fromModel(model) {
        // convert orderLines into an array of OrderLines
        let orderLines = [];
        let orderLinesStr = model.orderLines.value;
        if (orderLinesStr) {
            orderLinesStr.split(";").forEach((gtinCommaQuant) => {
                let gtinAndQuant = gtinCommaQuant.split(",");
                if (gtinAndQuant.length === 2) {
                    let gtin = gtinAndQuant[0];
                    let quantity = parseInt(gtinAndQuant[1]);
                    if (gtin && quantity) {
                        orderLines.push(new OrderLine(gtin, quantity, model.requesterId.value, model.senderId.value));
                    }
                }
            });
        }
        console.log("model.orderLines.value=", model.orderLines.value, "converted to=", orderLines);
        return new Order(model.orderId.value, model.requesterId.value, model.senderId.value, model.shipToAddress.value, OrderStatus.CREATED, orderLines);
    }

    /**
     * reads the product information (the /info path) from a given gtin (if exists and is registered to the mah)
     * @param {string} orderId
     * @param {function(err, Product)} callback
     */
    getOne(orderId, callback) {
        this.storage.getObject(`${this._getMountPath(orderId)}${INFO_PATH}`, (err, order) => {
            if (err)
                return callback(err);
            callback(undefined, order);
        });
    }

    /**
     * Lists all registered orders
     * @param {function(err, Order[])} callback
     */
     list(callback) {
        super.listMounts(ISSUED_ORDERS_MOUNT_PATH, (err, mounts) => {
            if (err)
                return callback(err);
            console.log(`Found ${mounts.length} orders at ${ISSUED_ORDERS_MOUNT_PATH}`);
            mounts = mounts.map(m => {
                console.log("Listing mounted m", m);
                m.path = `${ISSUED_ORDERS_MOUNT_PATH}/${m.path}`;
                return m;
            });
            super.readAll(mounts, callback);
        });
    }

    /**
     * Creates a blacnk {@link Order} with some specific initializations.
     * @param {string} orderId
     * @param {string} orderingTradingPartnerId
     * @param {string} shippingAddress
     * @returns {Order}
     */
    newBlankOrderSync(orderId, orderingTradingPartnerId, shippingAddress) {
        //let orderLine1 = new OrderLine('123', 1, '', '');
        //let orderLine2 = new OrderLine('321', 5, '', '');
        //return new Order(orderId, orderingTradingPartnerId, '', shippingAddress, OrderStatus.CREATED, [orderLine1, orderLine2]);
        return new Order(orderId, orderingTradingPartnerId, '', shippingAddress, OrderStatus.CREATED, []);
    }

    /**
     * Removes a order from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string} orderId
     * @param {function(err)} callback
     */
    remove(orderId, callback) {
        let self = this;
        let mount_path = this._getMountPath(orderId);
        self.storage.unmount(mount_path, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${orderId} removed from mount point ${mount_path}`);
            callback();
        });
    }

    /**
     * Convert an Order into a OrderControler view model. 
     * The order.orderLines are converted to a special format. See locale.js
     * @param {Order} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model) {
        model = model || {};
        for (let prop in object) {
            //console.log("prop", prop, "=='orderLines'", prop=="orderLines");
            if (object.hasOwnProperty(prop)) {
                if (!model[prop])
                    model[prop] = {};
                if (prop == "orderLines") {
                    model[prop].value = "";
                    let sep = "";
                    object[prop].forEach((orderLine) => {
                        model[prop].value += sep + orderLine.gtin + "," + orderLine.quantity;
                        sep = ";";
                    });
                } else {
                    model[prop].value = object[prop];
                }
            }
        }
        return model;
    }
}

let orderManager;
/**
 * @param {Archive} dsu
 * @returns {OrderManager}
 */
const getOrderManager = function (dsu) {
    if (!orderManager)
        orderManager = new OrderManager(dsu);
    return orderManager;
}

module.exports = getOrderManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\Manager.js","../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js","../services":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\index.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\ParticipantManager.js":[function(require,module,exports){
/**
 * @module fgt-mah-ssapp.managers
 */
const Order = require('../model/Order');
const OrderStatus = require('../model/OrderStatus');
const {INBOX_RECEIVED_ORDERS_PROP, INBOX_RECEIVED_SHIPMENTS_PROP, INFO_PATH, PARTICIPANT_MOUNT_PATH, INBOX_MOUNT_PATH} = require('../constants');

/**
 * Participant Manager Class
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * Should eventually integrate with the WP3 decisions
 *
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 * @param {string} domain the anchoring domain
 */
class ParticipantManager{
    constructor(dsuStorage, domain) {
        this.DSUStorage = dsuStorage;
        this.inboxService = new (require('../services').InboxService)(domain);
        this.participantService = new (require('../services').ParticipantService)(domain);
        this.resolver = undefined;
        this.participantDSU = undefined;
    };

    getParticipantDSU(){
        if (!this.participantDSU)
            throw new Error("ParticipantDSU not cached");
        return this.participantDSU;
    };

    /**
     * Creates a {@link Participant} dsu
     * @param {Participant} participant
     * @param {object} [inbox] - optional initial inbox contents.
     * @param {function(err, keySSI, string)} callback where the string is the mount path
     */
    create(participant, inbox, callback) {
        let self = this;
        if (!inbox)
            inbox = {};
        if (!callback) {
            callback = inbox;
            inbox = {};
        }
        if (typeof callback != "function")
            throw new Error("callback must be a function!");
        self.DSUStorage.enableDirectAccess(() => {
            self.participantService.create(participant, inbox, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Participant DSU created with ssi: ${keySSI.getIdentifier(true)}`);
                self.DSUStorage.mount(PARTICIPANT_MOUNT_PATH, keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Participant ${participant.id} created and mounted at '${PARTICIPANT_MOUNT_PATH}'`);
                    self._cacheParticipantDSU((err) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI, PARTICIPANT_MOUNT_PATH);
                    });
                });
            });
        });
    };

    /**
     * Creates an Order DSU and mounts it under issuedOrders/order.id
     * @param {OrderManager} orderManager 
     * @param {Order} order
     * @param {function(err, keySSI, mountPath)} callback
     */
    createIssuedOrder(orderManager, order, callback) {
        let self = this;
        self.locateConstWithInbox(order.senderId, INBOX_RECEIVED_ORDERS_PROP, (err, senderParticipantConstDSU) => {
            if (err)
                callback(err); 
            orderManager.create(order, (err, keySSI, mountPath) => {
                if (err)
                    return callback(err);
                const sReadSSI = keySSI.derive();
                // order.requesterId is me. order.senderId is the supplier.
                self.inboxAppend(senderParticipantConstDSU, INBOX_RECEIVED_ORDERS_PROP, sReadSSI.getIdentifier(true), (err) => {
                    if (err)
                        callback(err); // TODO rollback order creation ??
                    callback(undefined, keySSI, mountPath);
                });
            });
        });
    };

    _cacheParticipantDSU(callback){
        if (this.participantDSU)
            return callback();
        let self = this;
        self.DSUStorage.enableDirectAccess(() => {
            self.DSUStorage.listMountedDSUs('/', (err, mounts) => {
                if (err)
                    return callback(err);
                if (!mounts)
                    return callback("no mounts found!");
                self._matchParticipantDSU(mounts, (err, dsu) => {
                    if (err)
                        return callback(err);
                    self.participantDSU = dsu;
                    callback();
                });
            });
        });
    };

    _matchParticipantDSU(mounts, callback){
        // m.path has "participant". PARTICIPANT_MOUNT_PATH has "/participant".
        let mount = mounts.filter(m => m.path === PARTICIPANT_MOUNT_PATH.substr(1));
        if (!mount || mount.length !== 1)
            return callback("No participant mount found");
        this._loadDSU(mount[0].identifier, (err, dsu) => {
            if (err)
                return callback(err);
            console.log(`Participant DSU Successfully cached: ${mount[0].identifier}`);
            callback(undefined, dsu);
        });
    };

    _loadDSU(keySSI, callback){
        if (!this.resolver)
            this.resolver = require('opendsu').loadApi('resolver');
        this.resolver.loadDSU(keySSI, callback);
    };

    /**
     * reads the participant information (if exists)
     * @param {function(err, PARTICIPANT_MOUNT_PATH)} callback
     */
    getParticipant(callback){
        let self = this;
        self._cacheParticipantDSU((err) => {
            if (err)
                return callback(err);
            self.DSUStorage.getObject(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, (err, participant) => {
                if (err)
                    return callback(err);
                callback(undefined, participant);
            });
        });
    };

    /**
     * Append a message to the otherParticipantConstDSU.inbox.inboxPropName.
     * @param {Archive} otherParticipantConstDSU 
     * @param {string} inboxPropName 
     * @param {object} message 
     * @param {function(err)} callback
     */
    inboxAppend(otherParticipantConstDSU, inboxPropName, message, callback) {
        let self = this;
        let inboxPropPathName = self.inboxService.getPathFromProp(inboxPropName);
        if (!inboxPropPathName) 
            return callback("There is no property Inbox."+inboxPropName);
        let otherInboxPropPath = INBOX_MOUNT_PATH.substring(1)+inboxPropPathName;
        //otherParticipantConstDSU.listFiles("/",  {recursive: true}, (err, files) => {
        //    console.log("inboxAppend.FILES", files);
            otherParticipantConstDSU.readFile(otherInboxPropPath, (err, buffer) => {
                if (err)
                    return callback(createOpenDSUErrorWrapper("Cannot read file " + otherInboxPropPath, err));
                let inboxPropArray = JSON.parse(buffer);
                inboxPropArray.push(message);
                let inboxPropData = JSON.stringify(inboxPropArray);
                otherParticipantConstDSU.writeFile(otherInboxPropPath, inboxPropData, (err) => {
                    callback(err);
                });
            });
        //});
    };

    /**
     * Locate an Inbox from another participant.
     * The Inbox must have .propName data.
     * The propName is parsed in JSON into an array, message appended, and written back.
     * If not, and error is signaled.
     * @param {string} participantId 
     * @param {string} inboxPropName 
     * @param {function(err, participantConstDSU)} callback
     */
     locateConstWithInbox(participantId, inboxPropName, callback) {
        let self = this;
        self.participantService.locateConstDSU(participantId, (err, participantConstDSU) => {
            if (err)
                return callback(createOpenDSUErrorWrapper("Could not locate participant.id="+participantId,err));
            participantConstDSU.listFiles("/", {recursive: true}, (err, files) => {
                if (err)
                    return callback(err);
                console.log("locateConstWithInbox.FILES ", files);
                let inboxPropPathName = self.inboxService.getPathFromProp(inboxPropName);
                if (!inboxPropPathName) 
                    return callback("There is no property Inbox."+inboxPropName);
                // files returns a list of files without leading "/".
                // Remove leading "/" from paths.
                const filePath = INBOX_MOUNT_PATH.substring(1)+inboxPropPathName;
                if (!files.includes(filePath)) {
                    return callback("Participant.id="+participantId+" does not have "+filePath);
                };
                return callback(undefined, participantConstDSU);
            });
        });
    };
    
    /**
     * Creates a blank Order filled up with the details of this participant.
     * @param {OrderManager} orderManager 
     * @param {function(err, order)} callback
     */
    newBlankOrder(orderManager, callback) {
        let self = this;
        self.getParticipant((err, participant) => {
            if (err)
                return callback(err);
            let orderId = Math.floor(Math.random() * Math.floor(99999999999)); // TODO sequential unique numbering ? It should comes from the ERP anyway.
            let requestorId = participant.id;
            let shippingAddress = participant.address;
            let order = orderManager.newBlankOrderSync(orderId, requestorId, shippingAddress);
            callback(undefined, order);
        });
    };

    /**
     * Register a Participant for a Pharmacy and and mounts it to the participant path.
     * @param {Participant} participant 
     * @param {function(err)} callback 
     */
    registerPharmacy(participant, callback) {
        let self = this;
        // The Pharmacy has a receivedShipments inbox
        let inbox = {};
        inbox[INBOX_RECEIVED_SHIPMENTS_PROP] = [];
        self.create(participant, inbox, (err, keySSI, mountPath) => {
            if (err)
                return callback(err);
            callback();
        });
    };

    /**
     * Register a Participant for a Wholesaler and and mounts it to the participant path.
     * @param {Participant} participant 
     * @param {function(err)} callback 
     */
    registerWholesaler(participant, callback) {
        let self = this;
        // The Wholesaler has a receivedOrders and receivedShipments inbox
        let inbox = {};
        inbox[INBOX_RECEIVED_SHIPMENTS_PROP] = [];
        inbox[INBOX_RECEIVED_ORDERS_PROP] = [];
        self.create(participant, inbox, (err, keySSI, mountPath) => {
            if (err)
                return callback(err);
            callback();
        });
    };

    /**
     * Removes the PARTICIPANT_MOUNT_PATH DSU (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {function(err)} callback
     */
    remove(callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.DSUStorage.unmount(PARTICIPANT_MOUNT_PATH, (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant removed from mount point ${PARTICIPANT_MOUNT_PATH}`);
                callback();
            });
        });
    };

    /**
     * Edits/Overwrites the Participant details
     * @param {Participant} participant
     * @param {function(err)} callback
     */
    edit(participant, callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.DSUStorage.writeFile(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, JSON.stringify(participant), (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant updated`);
                callback();
            });
        });
    };
};

let participantManager;

/**
 * @param {DSUStorage} [dsuStorage]
 * @param {string} [domain]
 * @returns {ParticipantManager}
 */
const getParticipantManager = function (dsuStorage, domain) {
    if (!participantManager) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        if (!domain)
            throw new Error("No domain provided");
        participantManager = new ParticipantManager(dsuStorage, domain);
    }
    return participantManager;
}

module.exports = getParticipantManager;
},{"../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js","../model/Order":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Order.js","../model/OrderStatus":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\OrderStatus.js","../services":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\index.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\ProductManager.js":[function(require,module,exports){
const {INFO_PATH, PRODUCT_MOUNT_PATH, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Product = require('../model').Product;
/**
 * Product Manager Class
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Archive} storageDSU the DSU where the storage should happen
 */
class ProductManager extends Manager{
    constructor(storageDSU) {
        super(storageDSU);
        this.productService = new (require('../services').ProductService)(ANCHORING_DOMAIN);
        this.batchManager = require('./BatchManager')(storageDSU);
    }

    /**
     * Returns the mount path for a given gtin
     * @private
     */
    _getMountPath(gtin){
        return `${PRODUCT_MOUNT_PATH}/${gtin}`;
    }

    /**
     * Creates a {@link Product} dsu
     * @param {Product} product
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(product, callback) {
        let self = this;
        self.productService.create(product, (err, keySSI) => {
            if (err)
                return callback(err);
            let mount_path = this._getMountPath(product.gtin);
            self.storage.mount(mount_path, keySSI.getIdentifier(), (err) => {
                if (err)
                    return callback(err);
                console.log(`Product ${product.gtin} created and mounted at '${mount_path}'`);
                callback(undefined, keySSI, mount_path);
            });
        });
    }

    /**
     * reads the product information (the /info path) from a given gtin (if exists and is registered to the mah)
     * @param {string} gtin
     * @param {function(err, Product)} callback
     */
    getOne(gtin, callback){
        this.storage.getObject(`${this._getMountPath(gtin)}${INFO_PATH}`, (err, product) => {
            if (err)
                return callback(err);
            callback(undefined, product);
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string} gtin
     * @param {function(err)} callback
     */
    remove(gtin, callback) {
        let self = this;
        let mount_path = this._getMountPath(gtin);
        self.storage.unmount(mount_path, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${gtin} removed from mount point ${mount_path}`);
            callback();
        });
    }

    /**
     * Edits/Overwrites the product details
     * @param {string} gtin
     * @param {function(err)} callback
     */
    edit(gtin, callback) {
        let self = this;
        let mount_path = this._getMountPath(gtin);
        self.storage.writeFile(`${mount_path}${INFO_PATH}`, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${gtin} updated`);
            callback();
        });
    }

    /**
     * Lists all registered products
     * @param {function(err, Product[])} callback
     */
    getAll(callback) {
        super.listMounts(PRODUCT_MOUNT_PATH, (err, mounts) => {
            if (err)
                return callback(err);
            console.log(`Found ${mounts.length} products at ${PRODUCT_MOUNT_PATH}`);
            mounts = mounts.map(m => {
                m.gtin = m.path;
                m.path = `${PRODUCT_MOUNT_PATH}/${m.path}`;
                return m;
            });
            super.readAll(mounts, callback);
        });
    }

    /**
     *
     * @param model
     * @returns {Product}
     */
    fromModel(model){
        return new Product(super.fromModel(model));
    }
}

let productManager;
/**
 * @param {Archive} dsu
 * @returns {ProductManager}
 */
const getProductManager = function (dsu) {
    if (!productManager)
        productManager = new ProductManager(dsu);
    return productManager;
}

module.exports = getProductManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\Manager.js","../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js","../services":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\index.js","./BatchManager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\BatchManager.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\StockManager.js":[function(require,module,exports){
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Product = require('../model').Product;
const Batch = require('../model').Batch;
const STOCK_PATH = require('../constants').STOCK_PATH;

const STATUS = {
    IN_STOCK: "instock",
    RESERVED: "reserved",
    IN_TRANSIT: "intransit"
}
/**
 * Stock Manager Class
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Archive} storageDSU the DSU where the storage should happen
 */
class StockManager extends Manager{
    constructor(storageDSU) {
        super(storageDSU);
        this.stock = this._genDummyStock();
    }

    _getFromStatus(){
        let stock = {};
        Object.values(STATUS).forEach(s => stock[s] = {});
        return stock;
    }

    _genDummyStock(){
        let gtins = [1, 435, 1241, 435346]
        let batches = ["TS134", "FD214", "UY2345"];

        let stock = {};
        gtins.forEach((gtin, i) => {
            let bat = {}
            batches.forEach(batch => {
                bat[batch] = {
                    expiry: "cenas",
                    quantity: 300
                }
            });
            stock[gtin] = {
                name: "Product" + i,
                stock: bat
            };
        });
        let tempStock = this._getFromStatus();
        tempStock[STATUS.IN_STOCK] = stock;
        return tempStock;
    }

    get(callback){
        if (this.stock)
            return callback(undefined, this.stock);
        this.storage.getObject(STOCK_PATH, (err, stock) => {
           if (err)
               return callback(err);
           this.stock = stock;
           console.log("Retrieved stock");
           callback(undefined, this.toModel(stock));
        });
    }

    /**
     * @param {STATUS} [status] defaults to {@link STATUS.IN_STOCK}
     * @param callback
     */
    getByStatus(status, callback){
        if (typeof status === 'function'){
            callback = status;
            status = STATUS.IN_STOCK;
        }

        if (!status in this.stock)
            return callback("Status not found in stock");
        callback(undefined, this.stock[status]);
    }

    update(callback){
        this.storage.writeFile(STOCK_PATH, JSON.stringify(this.stock), (err) => {
            if (err)
                return callback(err);
            console.log("Updated stock!");
            callback();
        });
    }

    toModel(filteredStock, model){
        return Object.entries(filteredStock).map(([key, value]) => {
            return {
                gtin: key,
                name: value.name,
                batches: Object.keys(value.stock).join(', '),
                quantity:Object.values(value.stock).reduce((total, val) => total + val.quantity, 0)
            }
        });
    }
}

let stockManager;
/**
 * @param {Archive} dsu
 * @returns {StockManager}
 */
const getStockManager = function (dsu) {
    if (!stockManager)
        stockManager = new StockManager(dsu);
    return stockManager;
}

module.exports = getStockManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\Manager.js","../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\index.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.managers
 */

/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 */
module.exports = {
    Manager: require('../../pdm-dsu-toolkit/managers/Manager'),
    getOrderManager: require('./OrderManager'),
    getParticipantManager: require('./ParticipantManager'),
    getProductManager: require('./ProductManager'),
    getBatchManager: require('./BatchManager'),
    getStockManager: require('./StockManager'),
    getBaseManager: require('../../pdm-dsu-toolkit/managers/BaseManager')
}
},{"../../pdm-dsu-toolkit/managers/BaseManager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\BaseManager.js","../../pdm-dsu-toolkit/managers/Manager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\Manager.js","./BatchManager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\BatchManager.js","./OrderManager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\OrderManager.js","./ParticipantManager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\ParticipantManager.js","./ProductManager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\ProductManager.js","./StockManager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\managers\\StockManager.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Batch.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */

const Utils = require("../../pdm-dsu-toolkit/model/Utils");

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @prop {string[]} serialNumbers
 */
class Batch {
    batchNumber;
    expiry = "";
    serialNumbers = ["430239925150"];

    constructor(batch) {
        if (typeof batch !== undefined)
            for (let prop in batch)
                if (batch.hasOwnProperty(prop))
                    this[prop] = batch[prop];

        if (!this.batchNumber)
            this.batchNumber = Utils.generateSerialNumber(6);
    }

    generateViewModel() {
        return {label: this.batchNumber, value: this.batchNumber}
    }

    validate() {
        if (!this.batchNumber) {
            return 'Batch number is mandatory field';
        }
        if (!this.expiry) {
            return  'Expiration date is a mandatory field.';
        }
        return undefined;
    }

    addSerialNumbers(serials){
        throw new Error("Not implemented");
    }
}

module.exports = Batch;

},{"../../pdm-dsu-toolkit/model/Utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\model\\Utils.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\MAH.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
const Participant = require('./Participant');

class MAH extends Participant{

    constructor(mah) {
        super(mah);
        if (typeof mah !== undefined)
            for (let prop in mah)
                if (mah.hasOwnProperty(prop))
                    this[prop] = mah[prop];
    }
}

module.exports = MAH;
},{"./Participant":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Participant.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Order.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
const OrderStatus = require('./OrderStatus');

class Order{
    orderId;
    requesterId;
    senderId;
    shipToAddress;
    status;
    orderLines;

    constructor(orderId, requesterId, senderId, shipToAddress, status, orderLines) {
        this.orderId = orderId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || OrderStatus.CREATED;
        this.orderLines = orderLines || [];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.orderId) {
            errors.push('OrderID is required.');
        }
        if (!this.requesterId) {
            errors.push('Ordering partner ID is required.');
        }
        if (!this.senderId) {
            errors.push('Supplying partner ID is required.');
        }
        if (!this.shipToAddress) {
            errors.push('ShipToAddress is required.');
        }
        if (!this.status) {
            errors.push('status is required.');
        }
        if (!this.orderLines || this.orderLines.length == 0) {
            errors.push('orderLines is required.');
        } else {
            this.orderLines.forEach((orderLine,orderLineIndex) => {
                let orderLineErrors = orderLine.validate();
                if (orderLineErrors) {
                    orderLineErrors.forEach((error) => {
                        errors.push("Order Line "+orderLineIndex+": "+error);
                    });
                }
            });
        }

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = Order;

},{"./OrderStatus":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\OrderStatus.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\OrderLine.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
class OrderLine{
    gtin;
    quantity;
    requesterId;
    senderId;

    constructor(gtin, quantity, requesterId, senderId){
        this.gtin = gtin;
        this.quantity = quantity;
        this.requesterId = requesterId;
        this.senderId = senderId;
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.gtin) {
            errors.push('gtin is required.');
        }
        if (!this.quantity) {
            errors.push('quantity is required.');
        } else if (this.quantity < 0) { // TODO accept zero quantity ?
            errors.push('quantity cannot be negative.');
        }
        if (!this.requesterId) {
            errors.push('requesterId is required.');
        }
        if (!this.senderId) {
            errors.push('senderId is required.');
        }

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = OrderLine;

},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\OrderStatus.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
const OrderStatus = {
    CREATED: "created",
    ACKNOWLEDGED: "acknowledged",
    PICKUP: "pickup",
    TRANSIT: "transit",
    DELIVERED: "delivered",
    RECEIVED: "received",
    CONFIRMED: "confirmed"
}

module.exports = OrderStatus;
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Participant.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
const { Validatable } = require('../../pdm-dsu-toolkit/model/Validations');

class Participant extends Validatable{
    id = "";
    name = "";
    email = "";
    tin = "";
    address = "";

    constructor(participant){
        super();
        console.log("participant:" + participant);
        this._copyProps(participant);
    }

    _copyProps(participant){
        if (typeof participant !== undefined)
            for (let prop in participant)
                if (participant.hasOwnProperty(prop))
                    this[prop] = participant[prop];
    }

    validate() {
        const errors = [];
        if (!this.id)
            errors.push('id is required');
        if (!this.name)
            errors.push('Name is required.');
        if (!this.email)
            errors.push('email is required');
        if (!this.tin)
            errors.push('nif is required');

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.id}
    }
}

module.exports = Participant;
},{"../../pdm-dsu-toolkit/model/Validations":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\model\\Validations.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Pharmacy.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
const Actor = require('./Participant');

class Pharmacy extends Actor{
    deliveryAddress = "";

    constructor(pharmacy) {
        super(pharmacy);
        if (typeof pharmacy !== undefined)
            for (let prop in pharmacy)
                if (pharmacy.hasOwnProperty(prop))
                    this[prop] = pharmacy[prop];
    }

}

module.exports = Pharmacy;
},{"./Participant":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Participant.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Product.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
class Product {
    name = "";
    gtin = "";
    description = "";
    manufName = "";

    constructor(product) {
        if (typeof product !== undefined)
            for (let prop in product)
                if (product.hasOwnProperty(prop))
                    this[prop] = product[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.name) {
            errors.push('Name is required.');
        }

        if (!this.gtin) {
            errors.push('GTIN is required.');
        }

        return errors.length === 0 ? undefined : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.gtin}
    }
}

module.exports = Product;
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Shipment.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
class Shipment {
    shipmentId;
    requesterId;
    senderId;
    shipToAddress;
    status;

    constructor(shipmentId, requesterId, senderId, shipToAddress, status){
        this.shipmentId = shipmentId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || "created";
    }
}

module.exports = Shipment;

},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\ShipmentLine.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
class ShipmentLine{
    gtin;
    batch;
    quantity;
}

module.exports = ShipmentLine;

},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\ShipmentStatus.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
const ShipmentStatus = {
    CREATED: "created",
    ACKNOWLEDGED: "acknowledged",
    PICKUP: "pickup",
    TRANSIT: "transit",
    DELIVERED: "delivered",
    RECEIVED: "received",
    CONFIRMED: "confirmed"
}

module.exports = ShipmentStatus;
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Wholesaler.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
const Participant = require('./Participant');

class Wholesaler extends Participant{
    originAddress = "";
    deliveryAddress = "";

    constructor(wholesaler) {
        super(wholesaler);
        if (typeof wholesaler !== undefined)
            for (let prop in wholesaler)
                if (wholesaler.hasOwnProperty(prop))
                    this[prop] = wholesaler[prop];
    }
}

module.exports = Wholesaler;
},{"./Participant":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Participant.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
module.exports = {
    Order: require('./Order'),
    OrderStatus: require('./OrderStatus'),
    OrderLine: require('./OrderLine'),
    Shipment: require('./Shipment'),
    ShipmentStatus: require('./ShipmentStatus'),
    ShipmentLine: require('./ShipmentLine'),
    Participant: require('./Participant'),
    Product: require('./Product'),
    Batch: require('./Batch'),
    MAH: require('./MAH'),
    Pharmacy: require('./Pharmacy'),
    Wholesaler: require('./Wholesaler'),
    Validations: require('../../pdm-dsu-toolkit/model/Validations'),
    Utils: require('../../pdm-dsu-toolkit/model/Utils')
}

},{"../../pdm-dsu-toolkit/model/Utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\model\\Utils.js","../../pdm-dsu-toolkit/model/Validations":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\model\\Validations.js","./Batch":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Batch.js","./MAH":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\MAH.js","./Order":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Order.js","./OrderLine":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\OrderLine.js","./OrderStatus":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\OrderStatus.js","./Participant":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Participant.js","./Pharmacy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Pharmacy.js","./Product":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Product.js","./Shipment":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Shipment.js","./ShipmentLine":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\ShipmentLine.js","./ShipmentStatus":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\ShipmentStatus.js","./Wholesaler":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\Wholesaler.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\BatchService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function BatchService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const Batch = require('../model').Batch;
    const endpoint = 'batch';
    const keyGenFunction = require('../commands/setBatchSSI').createBatchSSI;
    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.generateKey = function(gtin, batchNumber){
        let keyGenData = {
            gtin: gtin,
            batch: batchNumber
        }
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Creates a {@link Batch} DSU
     * @param {string} gtin
     * @param {Batch} batch
     * @param {function(err, keySSI)} callback
     */
    this.create = function(gtin, batch, callback){

        let data = typeof batch === 'object' ? JSON.stringify(batch) : batch;

        if (isSimple){
            let keySSI = this.generateKey(gtin, batch.batchNumber);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/info', data, (err) => {
                    if (err)
                        return callback(err);
                    dsu.getKeySSIAsObject((err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        } else {
            let getEndpointData = function (batch){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: gtin,
                        batch: batch.batchNumber
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(batch), (builder, cb) => {
                builder.addFileDataToDossier("/info", data, cb);
            }, callback);
        }
    };
}

module.exports = BatchService;
},{"../../pdm-dsu-toolkit/services/strategy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js","../../pdm-dsu-toolkit/services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","../commands/setBatchSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setBatchSSI.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\InboxService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');
const {INBOX_PATHS_AND_PROPS} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function InboxService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Creates an Inbox DSU
     * @param {object} inbox
     * @param {function(err, inboxKeySSI)} callback
     */
    this.create = function(inbox, callback){
        if (isSimple){
            this.createSimple(inbox, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    };

    this.createSimple = function(inbox, callback) {
        let inboxKeyGenFunction = require('../commands/setInboxSSI').createInboxSSI;
        let inboxTemplateKeySSI = inboxKeyGenFunction(inbox, domain);

        utils.selectMethod(inboxTemplateKeySSI)(inboxTemplateKeySSI, (err, inboxDsu) => {
            if (err)
                return callback(err);
            inboxDsu.getKeySSIAsObject((err, inboxKeySSI) => {
                if (err)
                    return callback(err);
                let writeInfoArray = [...INBOX_PATHS_AND_PROPS];
                let writeInboxProp = function() {
                    if (!writeInfoArray || writeInfoArray.length == 0) {
                        return callback(undefined, inboxKeySSI);
                    } else {
                        const writeInfo = writeInfoArray.shift();
                        const propPath = writeInfo.path;
                        const propValue = inbox[writeInfo.prop];
                        console.log("Writing "+writeInfo.prop+" to "+propPath+" as "+JSON.stringify(propValue));
                        if (propValue) {
                            inboxDsu.writeFile(propPath, JSON.stringify(propValue), (err) => {
                                if (err)
                                    return callback(err);
                                writeInboxProp();
                            });
                        } else {
                            writeInboxProp();
                        }
                    }
                };
                writeInboxProp();
            });
        });
    };

    /**
     * Given an Inbox propName, locate the mounth path.
     * @param {string} propName 
     * @returns string. Undefined if propName not found.
     */
    this.getPathFromProp = function (propName) {
        let locatedPath;
        INBOX_PATHS_AND_PROPS.forEach((inboxPathAndProp) => {
            //console.log(inboxPathAndProp);
            if (inboxPathAndProp.prop == propName) {
                locatedPath = inboxPathAndProp.path;
            }
        });
        console.log("getPathFromProp ",propName,locatedPath);
        return locatedPath;
    };
}

module.exports = InboxService;
},{"../../pdm-dsu-toolkit/services/strategy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js","../../pdm-dsu-toolkit/services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","../commands/setInboxSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setInboxSSI.js","../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\LocaleService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
let SUPPORTED = {
    en_US: "en_US"
};

/**
 * This service needs a Global called LOCALE with the locale strings as such:
 * <pre>{
 *     "en_US": {
 *         "pageX": {
 *             "stringKey1": "...",
 *             "formComponent1": {
 *                 "title": "...",
 *                 "placeholder": "..."
 *             }
 *         },
 *         "pageY": {...}
 *     },
 *     "pt_PT": {
 *         "pageX": {
 *             "stringKey1": "...",
 *             "formComponent1": {
 *                 "title": "...",
 *                 "placeholder": "..."
 *             }
 *         },
 *         "pageY": {...}
 *     }
 * }</pre>
 * <strong>locale.js should be included in index.html via</strong>
 * <pre>
 *     <script src="resources/locale/locale.js"></script>
 * </pre>
 * And will provide access to the strings via '@locale.pageX.key1'
 * @param {SUPPORTED} lang
 */
function LocaleService(lang){
    let _genSupported = function(){
        if (!LOCALE)
            throw new Error("Could not find Locale Resource");
        let available = Object.keys(LOCALE);
        available.forEach(a => {
            SUPPORTED[a] = a;
        })
    };

    _genSupported();

    lang = lang || SUPPORTED.en_US;
    let localeObj;

    /**
     * Loads the selected locale
     * @param {SUPPORTED} locale
     */
    this.loadLocale = function(locale){
        if (!SUPPORTED.hasOwnProperty(locale))
            throw new Error("Unsupported Locale");
        localeObj = LOCALE[locale];
    }

    /**
     * binds the SetModel method of the controller to always include the locale info in one of two ways:
     *  <ul>
     *     <li>No page is provided: The model will have the whole locale object under the 'locale' key</li>
     *     <li>A page is provided: the entries under that key will be applied directly to the model, being overwritten by the provided model<br>
     *         Useful for forms</li>
     * </ul>
     * @param {Object} model
     * @param {string} [page]
     */
    this.bindToModel = function(model, page){
        if (!model || typeof model !== 'object')
            throw new Error("Model is not suitable for locale binding");
        if (!page)
            model.locale = JSON.parse(JSON.stringify(localeObj));
        else {
            let tempObj = JSON.parse(JSON.stringify(localeObj[page]));
            model = merge(tempObj, JSON.parse(JSON.stringify(model)));
        }
        return model;
    }

    this.loadLocale(lang);
}


const merge = function(target, source){
    for (const key of Object.keys(source))
        if (source[key] instanceof Object)
            Object.assign(source[key], merge(target[key] ? target[key] : {}, source[key]))
    Object.assign(target || {}, source)
    return target;
}

const bindToController = function(controller, page){
    if (!controller.localized) {
        let func = controller.setModel;
        let m = controller.model;
        controller.setModel = function (model) {
            model = localeService.bindToModel(model, page);
            return func(model);
        };
        controller.setModel(m ? m : {});
        controller.localized = true;
    }
}

let localeService;

module.exports = {
    /**
     * Returns the instance of the LocaleService and binds the locale info to the controller via {@link LocaleService#bindToModel}
     * @param {ContainerController} controller: the current controller
     * @param {SUPPORTED} locale: the supported language to use
     * @param {string} [page]: the name of the view. Must match an existing key in LOCALE
     * @returns {LocaleService}
     */
    bindToLocale: function (controller,locale, page){
        if (!localeService)
            localeService = new LocaleService(locale);
        bindToController(controller, page);
        return localeService;
    },
    supported: {...SUPPORTED}
}
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\OrderLineService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function OrderLineService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const OrderLine = require('../model').OrderLine;
    const endpoint = 'orderline';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    /**
     * Creates an order DSU
     * @param {string} orderId
     * @param {OrderLine} orderLine
     * @param {function} callback
     * @return {string} keySSI
     */
    this.create = function(orderId, orderLine, callback){

        let data = typeof orderLine == 'object' ? JSON.stringify(orderLine) : orderLine;

        let keyGenData = {
            gtin: orderLine.gtin,
            requesterId: orderLine.requesterId,
            orderId: orderId
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setOrderLineSSI').createOrderLineSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/info', data, (err) => {
                    if (err)
                        return callback(err);
                    dsu.getKeySSIAsObject((err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        } else {
            let getEndpointData = function (orderLine){
                return {
                    endpoint: endpoint,
                    data: {
                        orderId: orderId,
                        gtin: orderLine.gtin,
                        requesterId: orderLine.requesterId
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(orderLine), (builder, cb) => {
                builder.addFileDataToDossier("/info", data, cb);
            }, callback);
        }
    };
}

module.exports = OrderLineService;
},{"../../pdm-dsu-toolkit/services/strategy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js","../../pdm-dsu-toolkit/services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","../commands/setOrderLineSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderLineSSI.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\OrderService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function OrderService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const model = require('../model');
    const Order = model.Order;
    const OrderStatus = model.OrderStatus;
    const endpoint = 'order';

    domain = domain || "default";
    const orderLineService = new (require('./OrderLineService'))(domain, strategy);
    const statusService = new (require('./StatusService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Creates an order
     * @param {Order} order
     * @param {function(err, keySSI)} callback
     */
    this.create = function(order, callback){
        // if product is invalid, abort immediatly.
        if (typeof order === 'object') {
            let err = order.validate();
            if (err)
                return callback(err);
        }

        if (isSimple){
            createSimple(order, callback);
        } else {
            createAuthorized(order, callback);
        }
    }

    /**
     * Creates the original OrderStatus DSU
     * @param {OrderStatus} [status]: defaults to OrderStatus.CREATED
     * @param {function(err, keySSI)} callback
     */
    let createOrderStatus = function(status, callback){
        if (typeof status === 'function'){
            callback = status;
            status = OrderStatus.CREATED;
        }
        statusService.create(status, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`Status DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    let createSimple = function(order, callback){
        let keyGenFunction = require('../commands/setOrderSSI').createOrderSSI;
        let templateKeySSI = keyGenFunction(order, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/info', JSON.stringify(order), (err) => {
                if (err)
                    return callback(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return callback(err);
                    dsu.writeFile('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        createOrderStatus((err, keySSI) => {
                            if (err)
                                return callback(err);
                            // Mount must take string version of keyssi
                            dsu.mount("/status", keySSI.getIdentifier(), (err) => {
                                if (err)
                                    return callback(err);
                                console.log(`Status DSU (${keySSI.getIdentifier(true)}) mounted at '/status'`);
                                dsu.getKeySSIAsObject((err, keySSI) => {
                                    if (err)
                                        return callback(err);
                                    callback(undefined, keySSI);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function(order, callback){
        let getEndpointData = function (order){
            return {
                endpoint: endpoint,
                data: {
                    orderId: order.orderId,
                    requesterId: order.requesterId
                }
            }
        }

        utils.getDSUService().create(domain, getEndpointData(order), (builder, cb) => {
            builder.addFileDataToDossier("/info", JSON.stringify(order), (err)=> {
                if (err)
                    return cb(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return cb(err);
                    builder.addFileDataToDossier('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return cb(err);
                        createOrderStatus((err, keySSI) => {
                            if (err)
                                return cb(err);
                            builder.mount('/status', keySSI.getIdentifier(), (err) => {
                                if (err)
                                    return cb(err);
                                cb();
                            })
                        });
                    });
                });
            });
        }, callback);
    }

    /**
     * Creates OrderLines DSUs for each orderLine in order
     * @param {Order} order
     * @param {function} callback
     * @return {Object[]} keySSIs
     */
    let createOrderLines = function(order, callback){
        let orderLines = [];

        let iterator = function(order, items, callback){
            let orderLine = items.shift();
            if (!orderLine)
                return callback(undefined, orderLines);
            orderLineService.create(order.orderId, orderLine, (err, keySSI) => {
                if (err)
                    return callback(err);
                orderLines.push(keySSI);
                iterator(order, items, callback);
            });
        }
        // the slice() clones the array, so that the shitf() does not destroy it.
        iterator(order, order.orderLines.slice(), callback);
    }
}

module.exports = OrderService;
},{"../../pdm-dsu-toolkit/services/strategy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js","../../pdm-dsu-toolkit/services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","../commands/setOrderSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setOrderSSI.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js","./OrderLineService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\OrderLineService.js","./StatusService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\StatusService.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\ParticipantService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
 const {INBOX_MOUNT_PATH, INFO_PATH, PUBLIC_ID_MOUNT_PATH} = require('../constants');
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ParticipantService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const inboxService = new (require('./InboxService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    domain = domain || "default";

    /**
     * Creates an Participant's DSU, including the const and MQ.
     * @param {Participant} participant
     * @param {object} [inbox] - optional initial inbox contents.
     * @param {function(err, participantKeySSI)} callback
     */
    this.create = function(participant, inbox, callback){
        if (!inbox)
            inbox = {};
        if (!callback) {
            callback = inbox;
            inbox = {};
        }
        if (typeof callback != "function")
            throw new Error("callback must be a function!");
        if (isSimple){
            createSimple(participant, inbox, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function (participant, inbox, callback) {
        inboxService.create(inbox, (err, inboxSSI) => {
            if (err)
                return err;
            let participantKeyGenFunction = require('../commands/setParticipantSSI').createParticipantSSI;
            let participantConstKeyGenFunction = require('../commands/setParticipantConstSSI').createParticipantConstSSI;
            let participantTemplateKeySSI = participantKeyGenFunction(participant, domain);
            let participantConstTemplateKeySSI = participantConstKeyGenFunction(participant, domain);
            // Test of the const already exists for the given participant.id.
            // Commented out because error messages are not very good!
            // Let it fail on creating a dup const.
            //
            // TODO better error message for duplicate id ?
            //
            //const openDSU = require('opendsu');
            //const resolver = openDSU.loadApi("resolver");
            //resolver.loadDSU(participantConstTemplateKeySSI, undefined, (err, participantConstDsu) => {
            //    console.log("loadDSU error", err);
            //    if (!err) {
            //        callback("There is already a ParticipantConst DSU id=" + participant.id);
            //    }
            //
            // Create the const first. As it is non-transactional, if it fails, stop right away.
            utils.selectMethod(participantConstTemplateKeySSI)(participantConstTemplateKeySSI, (err, participantConstDsu) => {
                if (err)
                    return callback(err);
                participantConstDsu.getKeySSIAsObject((err, participantConstKeySSI) => {
                    if (err)
                        return callback(err);
                    console.log("participantConstKeySSI ", participantConstKeySSI.getIdentifier());
                    participantConstDsu.writeFile(INFO_PATH, JSON.stringify({ id: participant.id }), (err) => {
                        if (err)
                            return callback(err);
                        participantConstDsu.mount(INBOX_MOUNT_PATH, inboxSSI.getIdentifier(), (err) => {
                            if (err)
                                return callback(err);
                            console.log(`Inbox ${inboxSSI.getIdentifier()} mounted at ${INBOX_MOUNT_PATH}`);
                            utils.selectMethod(participantTemplateKeySSI)(participantTemplateKeySSI, (err, participantDsu) => {
                                if (err)
                                    return callback(err);
                                participantDsu.writeFile(INFO_PATH, JSON.stringify(participant), (err) => {
                                    if (err)
                                        return callback(err);
                                    participantDsu.getKeySSIAsObject((err, participantKeySSI) => {
                                        if (err)
                                            return callback(err);
                                        participantDsu.mount(PUBLIC_ID_MOUNT_PATH, participantConstKeySSI.getIdentifier(), (err) => {
                                            if (err)
                                                return callback(err);
                                            callback(undefined, participantKeySSI);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    /**
     * Locate the const DSU of a participant, given the id.
     * @param {string} id - a Participant.id
     * @param {function(err, participantConstDsu)} callback
     */
    this.locateConstDSU = function(id, callback) {
        const opendsu = require("opendsu");
        const resolver = opendsu.loadApi("resolver");
        const participantConstKeyGenFunction = require('../commands/setParticipantConstSSI').createParticipantConstSSI;
        const participantConstKeySSI = participantConstKeyGenFunction({id: id}, domain);
        resolver.loadDSU(participantConstKeySSI, (err, participantConstDsu) => {
            if (err)
                return callback(err);
            callback(undefined, participantConstDsu);
        });
    };

};

module.exports = ParticipantService;
},{"../../pdm-dsu-toolkit/services/strategy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js","../../pdm-dsu-toolkit/services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","../commands/setParticipantConstSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setParticipantConstSSI.js","../commands/setParticipantSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setParticipantSSI.js","../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\constants.js","./InboxService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\InboxService.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\ProductService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ProductService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const Product = require('../model').Product;
    const endpoint = 'product';
    const keyGenFunction = require('../commands/setProductSSI').createProductSSI;

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.generateKey = function(gtin){
        let keyGenData = {
            gtin: gtin
        }
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Creates a {@link Product} DSU
     * @param {Product} product
     * @param {function(err, keySSI)} callback
     */
    this.create = function(product, callback){

        let data = typeof product === 'object' ? JSON.stringify(product) : product;
        // if product is invalid, abort immediatly.
        if (typeof product === 'object') {
            let err = product.validate();
            if (err)
                return callback(err);
        }

        if (isSimple){
            let keySSI = this.generateKey(product.gtin);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/info', data, (err) => {
                    if (err)
                        return callback(err);
                    dsu.getKeySSIAsObject((err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        } else {
            let getEndpointData = function (product){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: product.gtin,
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(product), (builder, cb) => {
                builder.addFileDataToDossier("/info", data, cb);
            }, callback);
        }
    };
}

module.exports = ProductService;
},{"../../pdm-dsu-toolkit/services/strategy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js","../../pdm-dsu-toolkit/services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","../commands/setProductSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setProductSSI.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\ShipmentService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\StatusService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function StatusService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const OrderStatus = require('../model').OrderStatus;
    const endpoint = 'status';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    let selectMethod = function(templateKeySSI){
        if (templateKeySSI.getTypeName() === 'array')
            return utils.getResolver().createDSUForExistingSSI;
        return utils.getResolver().createDSU;
    }
    /**
     * Creates an OrderStatus DSU
     * @param {OrderStatus|ShipmentStatus} status
     * @param {function} callback
     * @return {string} keySSI
     */
    this.create = function(status, callback){

        let data = JSON.stringify(status);

        if (isSimple){
            let keyGenFunction = require('../commands/setStatusSSI').createStatusSSI;
            let keySSI = keyGenFunction(status, domain);
            selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/info', data, (err) => {
                    if (err)
                        return callback(err);
                    dsu.getKeySSIAsObject((err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        } else {
            let endpointData = {
                    endpoint: endpoint,
                    data: data
                }

            utils.getDSUService().create(domain, endpointData, (builder, cb) => {
                builder.addFileDataToDossier("/info", data, cb);
            }, callback);
        }
    };
}

module.exports = StatusService;
},{"../../pdm-dsu-toolkit/services/strategy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js","../../pdm-dsu-toolkit/services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","../commands/setStatusSSI":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\commands\\setStatusSSI.js","../model":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\model\\index.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\index.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
module.exports = {
    DSUService: require('../../pdm-dsu-toolkit/services/DSUService'),
    ParticipantService: require('./ParticipantService'),
    InboxService: require("./InboxService"),
    LocaleService: require("./LocaleService"),
    WebcLocaleService: require("../../pdm-dsu-toolkit/services/WebcLocaleService"),
    OrderLineService: require("./OrderLineService"),
    OrderService: require("./OrderService"),
    ShipmentService: require("./ShipmentService"),
    StatusService: require("./StatusService"),
    ProductService: require("./ProductService"),
    BatchService: require("./BatchService"),
    Strategy: require("../../pdm-dsu-toolkit/services/strategy"),
    utils: require('../../pdm-dsu-toolkit/services/utils')
}
},{"../../pdm-dsu-toolkit/services/DSUService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\DSUService.js","../../pdm-dsu-toolkit/services/WebcLocaleService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\WebcLocaleService.js","../../pdm-dsu-toolkit/services/strategy":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js","../../pdm-dsu-toolkit/services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","./BatchService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\BatchService.js","./InboxService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\InboxService.js","./LocaleService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\LocaleService.js","./OrderLineService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\OrderLineService.js","./OrderService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\OrderService.js","./ParticipantService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\ParticipantService.js","./ProductService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\ProductService.js","./ShipmentService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\ShipmentService.js","./StatusService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\services\\StatusService.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\version.js":[function(require,module,exports){
// IMPORTANT: THIS FILE IS AUTO GENERATED BY bin/version.js - DO NOT MANUALLY EDIT OR CHECKIN!
const VERSION = {
    "dirty": true,
    "raw": "41c610d-dirty",
    "hash": "41c610d",
    "distance": null,
    "tag": null,
    "semver": null,
    "suffix": "41c610d-dirty",
    "semverString": null,
    "version": "0.1.3"
};

module.exports = VERSION;

},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\commands\\setSSI.js":[function(require,module,exports){
/**
 * Registers with the DSU Wizard the provided endpoints for the various DSU types
 * @param {HttpServer} server  the server object
 * @param {string} endpoint  the endpoint to be registered
 * @param {function} factoryMethod  the method that receives a data object with the parameters required to generate the keyssi, and is responsible for the creation of the DSU
 * @param {string} methodName   the name of the method to be registered in the DSU Wizard? - Should match the method name that is calling it?
 * @param {string} [domain] domain where to anchor the DSU - defaults to 'default'
 * @module server
 */
function setSSI(server, endpoint, factoryMethod, methodName, domain){
    domain = domain || "default";
    const dsu_wizard = require("dsu-wizard");
    const commandRegistry = dsu_wizard.getCommandRegistry(server);
    const utils = dsu_wizard.utils;

    commandRegistry.register("/" + endpoint, "post", (req, callback) => {
        const transactionManager = dsu_wizard.getTransactionManager();

        utils.bodyParser(req, err => {
            if(err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to parse body`, err));

            const data = JSON.parse(req.body);
            const elemSSI = factoryMethod(data, domain);

            transactionManager.getTransaction(req.params.transactionId, (err, transaction) => {
                transaction.context.keySSI = elemSSI.getIdentifier();
                transaction.context.forceNewDSU = true;                 // TODO: Why? could not find documentation
                transaction.context.options.useSSIAsIdentifier = true;  // TODO: Why? could not find documentation
                transactionManager.persistTransaction(transaction, err => {
                    if(err)
                        return callback(err);

                    const command = dsu_wizard.getDummyCommand().create(methodName);  // TODO: why?
                    return callback(undefined, command);
                });
            });
        });
    });
}

module.exports = setSSI;

},{"dsu-wizard":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\constants.js":[function(require,module,exports){
/**
 * Constants
 * @module constants
 */

/**
 * default info writing path in DSU's since you can't write to '/'
 */
const INFO_PATH = '/info';

/**
 * Default mount path for the participant const under the PDM SSApp Architecture
 */
const PARTICIPANT_MOUNT_PATH = "/participant";

/**
 * Default mount path for the Id DSU under the PDM SSApp Architecture
 */
const IDENTITY_MOUNT_PATH = '/id'

const DATABASE_MOUNT_PATH = '/db'

const DID_METHOD = 'demo'

const MESSAGE_REFRESH_RATE = 1000;
const MESSAGE_TABLE = 'messages'

module.exports = {
    INFO_PATH,
    PARTICIPANT_MOUNT_PATH,
    IDENTITY_MOUNT_PATH,
    DATABASE_MOUNT_PATH,
    DID_METHOD,
    MESSAGE_REFRESH_RATE,
    MESSAGE_TABLE
}
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\BaseManager.js":[function(require,module,exports){
/**
 * @module managers
 */

/**
 *
 */
const {INFO_PATH, PARTICIPANT_MOUNT_PATH, IDENTITY_MOUNT_PATH, DATABASE_MOUNT_PATH} = require('../constants');
const { getResolver , _err} = require('../services/utils');
const relevantMounts = [PARTICIPANT_MOUNT_PATH, DATABASE_MOUNT_PATH];
const {MessageManager, Message} = require('./MessageManager');
/**
 * Base Manager Class
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * This Base Manager Class is designed to integrate with the pdm-trust-loader and a init.file configuration of
 * <pre>
 *      define $ID$ fromvar -$Identity-
 *      define $ENV$ fromvar -$Environment-
 *
 *      with cmd createdsu seed traceability specificstring
 *          define $SEED$ fromcmd getidentifier true
 *          createfile info $ID$
 *      endwith
 *      createfile environment.json $ENV$
 *      mount $SEED$ /id
 *
 *      with var $SEED$
 *          define $READ$ fromcmd derive true
 *      endwith
 *
 *      define $SECRETS$ fromcmd objtoarray $ID$
 *
 *      with cmd createdsu const traceability $SECRETS$
 *          mount $READ$ /id
 *          define $CONST$ fromcmd getidentifier true
 *      endwith
 *
 *      mount $CONST$ /participant
 *
 *      with cmd createdsu seed traceability fordb
 *          define $DB$ fromcmd getidentifier true
 *      endwith
 *
 *      mount $DB$ /db
 * </pre>
 *
 * it also integrates with the {@link DSUStorage} to provide direct access to the Base DSU by default.
 *
 * All other Managers in this architecture can inherit from this to get access to the getIdentity && getEnvironment API from the credentials set in the pdm-loader
 *
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 * @param {string} domain the anchoring domain
 * @module managers
 * @class BaseManager
 * @abstract
 */
class BaseManager {
    constructor(dsuStorage) {
        this.DSUStorage = dsuStorage;
        this.rootDSU = undefined;
        this.db = undefined;
        this.participantConstSSI = undefined;
        this.did = undefined;
        this.messenger = undefined;
        this._initialize((err) => {
            console.log(err);
        })
    };

    sendMessage(did, api, message, callback){
        const msg = new Message(api, message)
        this.messenger.sendMessage(did, msg, callback);
    }

    getMessages(callback){

    }

    _getRootDSU(){
        if (!this.rootDSU)
            throw new Error("ParticipantDSU not cached");
        return this.rootDSU;
    };

    _initialize(callback){
        if (this.rootDSU)
            return callback();
        let self = this;
        self.DSUStorage.enableDirectAccess(() => {
            self.rootDSU = self.DSUStorage;
            self.getIdentity((err, identity) => err
                ? _err(`Could not get Identity`, err, callback)
                : self._cacheRelevant(callback, identity));
        });
    };

    _cleanPath(path){
        return path[0] === '/' ? path.substring(1) : path;
    }

    _verifyRelevantMounts(mounts){
        return DATABASE_MOUNT_PATH in mounts && PARTICIPANT_MOUNT_PATH in mounts;
    }

    _cacheRelevant(callback, identity){
        let self = this;
        this.rootDSU.listMountedDSUs('/', (err, mounts) => {
            if (err)
                return _err(`Could not list mounts in root DSU`, err, callback);
            const relevant = {};
            mounts.forEach(m => {
                if (relevantMounts.indexOf(m.path) !== -1)
                    relevant[m.path] = m.identifier;
            });
            if (!self._verifyRelevantMounts(relevant))
                return callback(`Loader Initialization failed`);
            self.db = require('opendsu').loadApi('db').getWalletDB(relevant[DATABASE_MOUNT_PATH]);
            self.messenger = new MessageManager(self.db, self._getDIDString(identity));
            self.participantConstSSI = relevant[PARTICIPANT_MOUNT_PATH];
            console.log(`Database Cached`);
            callback()
        });
    }

    _loadDSU(keySSI, callback){
        getResolver().loadDSU(keySSI, callback);
    };

    /**
     * reads the participant information (if exists)
     * @param {function(err, object)} callback
     */
    getIdentity(callback){
        let self = this;
        self.DSUStorage.getObject(`${PARTICIPANT_MOUNT_PATH}${IDENTITY_MOUNT_PATH}${INFO_PATH}`, (err, participant) => err
            ? _err(`Could not get identity`, err, callback)
            : callback(undefined, participant));
    };

    /**
     * Must return the string to be used to generate the DID
     * @param {object} identity
     * @param {string} participantConstSSI
     * @param {function(err, string)}callback
     * @private
     */
    _getDIDString(identity, participantConstSSI, callback){
        throw new Error(`Subclasses must implement this`);
    }

    /**
     * Edits/Overwrites the Participant details. Should this be allowed??
     * @param {Participant} participant
     * @param {function(err)} callback
     */
    editIdentity(participant, callback) {
        this._initialize(err => {
            if (err)
                return _err(`Could not initialize`, err, callback);
            self.DSUStorage.setObject(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, JSON.stringify(participant), (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant updated`);
                callback(undefined, participant);
            });
        });
    };
}

module.exports = BaseManager;
},{"../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\constants.js","../services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","./MessageManager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\MessageManager.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\Manager.js":[function(require,module,exports){
const {PARTICIPANT_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerns is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Archive|Database} storage the DSU where the storage should happen or more commonly the Database Object
 * @module managers
 * @class Manager
 */
class Manager{
    constructor(storage){
        this.storage = storage;
    }

    /**
     * Should translate the Controller Model into the Business Model
     * @param model the Controller's Model
     * @returns {dict} the Business Model object ready to feed to the constructor
     */
    fromModel(model){
        let result = {};
        Object.keys(model).forEach(key => {
            if (model.hasOwnProperty(key) && model[key].value)
                result[key] = model[key].value;
        });
        return result
    }

    /**
     * @param {object} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model){
        model = model || {};
        for (let prop in object)
            if (object.hasOwnProperty(prop)){
                if (!model[prop])
                    model[prop] = {};
                model[prop].value = object[prop];
            }
        return model;
    }
}

module.exports = Manager;
},{"../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\constants.js"}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\MessageManager.js":[function(require,module,exports){
const Manager = require('./Manager')
const { _err } = require('../services/utils')
const { MESSAGE_REFRESH_RATE, DID_METHOD, MESSAGE_TABLE } = require('../constants');

/**
 * @typedef W3cDID
 */

/**
 * Class to wrap messages
 */
class Message{
    /**
     *
     * @param {string} api
     * @param {*} message anything as long as it is serializable i guess
     * @param {W3cDID} senderDID
     */
    constructor(api, message){
        this.api = api;
        this.message = message;
    }
}
/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerns is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Database} storage the DSU where the storage should happen or more commonly the Database Object
 * @param {string} didString
 * @param {function(Message)} [onNewMessage] defaults to a console log
 * @module managers
 * @class Manager
 */
class MessageManager extends Manager{
    constructor(db, didString){
        super(db);
        this.w3cDID = require('opendsu').loadApi('w3cdid');
        this.didString = didString;
        this.did = undefined;
        let self = this;
        this._listeners = {};
        this.getOwnDID((err, didDoc) => err
            ? createOpenDSUErrorWrapper(`Could not get Own DID`, err)
            : self._startMessageListener(didDoc));
    }

    _receiveMessage(message, callback){
        const {api} = message;
        let self = this;
        self._saveToInbox(message, (err) => {
            if (err)
                return _err(`Could not save message to inbox`, err, callback);
            console.log(`Message ${JSON.stringify(message)} saved to inbox`);
            if (api in self._listeners) {
                console.log(`Found ${self._listeners[api].length} listeners for the ${api} message api`)
                self._listeners[api].forEach(apiListener => {
                    apiListener(message);
                });
            }
        });
    }

    _saveToInbox(message, callback){
        this.storage.insertRecord(MESSAGE_TABLE, Date.now().toISOString(), JSON.stringify(message), callback);
    }

    /**
     *
     * @param {string} api
     * @param {function(Message)} onNewApiMsgListener
     */
    registerListeners(api, onNewApiMsgListener){
        if (!(api in this._listeners))
            this._listeners[api] = [];
        this._listeners[api].push(onNewApiMsgListener);
    }

    /**
     * Sends a Message to the provided did
     * @param {string|W3cDID} did
     * @param {Message} message
     * @param {function(err)}callback
     */
    sendMessage(did, message, callback){
        if (typeof did === 'string')
            return this._getDID(did, (err, didDoc) => err
                ? _err(`Could not get DID Document for string ${did}`, err, callback)
                : sendMessage(didDoc, message, callback));

        this.getOwnDID((selfDID) => {
            selfDID.sendMessage(message, did.getIdentifier(), err => err
                ? _err(`Could not send Message`, err, callback)
                : callback());
        });
    }

    getMessages(api, callback){
        if (typeof api === 'function'){
            callback = api;
            api = MESSAGE_TABLE;
        }
        this.storage.filter(api, () => true, undefined, 10, callback);
    }

    _startMessageListener(did){
        let self = this;
        setTimeout(() => {
            did.readMessage((err, message) => {
                if (err)
                    return createOpenDSUErrorWrapper(`Could not read message`, err);
                self._receiveMessage(message, (err, message) => err
                    ? createOpenDSUErrorWrapper(`Failed to receive message`, err)
                    : console.log(`Message received ${message}`));
            });
        }, MESSAGE_REFRESH_RATE);
    }

    getOwnDID(callback){
        if (this.did)
            return callback(undefined, this.did);
        this._getDID(this.didString, callback);
    }

    _getDID(didString, callback){
        this.w3cDID.createIdentity(DID_METHOD, didString, (err, didDoc) => err
            ? _err(`Could not create DID identity`, err, callback)
            : callback(undefined, didDoc));
    }
}

let messageManager;

/**
 * @param {Database} storage the DSU where the storage should happen or more commonly the Database Object
 * @param {string} didString
 * @param {function(Message)} onNewMessage
 * @returns {MessageManager}
 * @module managers
 */
const getMessageManager = function (storage, didString, onNewMessage) {
    if (!messageManager) {
        if (!storage)
            throw new Error("No storage provided");
        messageManager = new MessageManager(storage, didString, onNewMessage);
    }
    return messageManager;
}

module.exports = {
    getMessageManager,
    Message
};
},{"../constants":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\constants.js","../services/utils":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","./Manager":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\managers\\Manager.js","opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\model\\Utils.js":[function(require,module,exports){
/**
 * @module utils
 */

/**
 * Generates a string of the provided length filled with random characters from the provided characterSet
 * Clone of PrivateSky Code
 */
function generate(charactersSet, length){
    let result = '';
    const charactersLength = charactersSet.length;
    for (let i = 0; i < length; i++) {
        result += charactersSet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    /**
     * Generates a string of the provided length filled with random characters from 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
     * Clone of PrivateSky Code
     */
    generateID(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return generate(characters, length);
    },

    /**
     * Generates a string of the provided length filled with random numeric characters
     * Clone of PrivateSky Code
     */
    generateNumericID(length) {
        const characters = '0123456789';
        return generate(characters, length);
    },

    /**
     * Clone of PrivateSky Code
     */
    generateSerialNumber(length){
        let char = generate("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 2);
        let number = this.generateNumericID(length-char.length);
        return char+number;
    }
}
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\model\\Validations.js":[function(require,module,exports){
/**
 * @module validations
 * @memberOf toolkit.model.validations
 */

/**
 * Supported ion-input element types
 */
const ION_TYPES = {
    EMAIL: "email",
    NUMBER: "number",
    TEXT: "text",
    DATE: "date"
}

/**
 * Supported ion-input element sub-types (under the {@link ION_CONST.name_key})
 */
const SUB_TYPES = {
    TIN: "tin"
}

/**
 *
 */
const QUERY_ROOTS = {
    controller: "controller",
    parent: "parent",
    self: "self"
}
/**
 * Html attribute name constants
 *
 * mostly straightforward with the notable exceptions:
 *  - {@link ION_CONST.error.append} variable append strategy - que root of the css query
 *  - {@link ION_CONST.error.queries}:
 *    - {@link ION_CONST.error.queries.query} the media query that while be made via {@link HTMLElement#querySelectorAll}
 *    - {@link ION_CONST.error.queries.variables} variables that will be set/unset:
 *       the keys will be concatenated with '--' eg: key => element.style.setProperty('--' + key, variables[key].set)
 *
 *       The placeholder ${name} can be used to mark the field's name
 */
const ION_CONST = {
    name_key: "name",
    type_key: "type",
    required_key: "required",
    max_length: "maxlength",
    min_length: "minlength",
    max_value: "max",
    min_value: "min",
    input_tag: "ion-input",
    error: {
        queries: [
            {
                query: "ion-input",
                root: "parent",
                variables: [
                    {
                        variable: "--color",
                        set: "var(--ion-color-danger)",
                        unset: "var(--ion-color)"
                    }
                ]
            },
            {
                query: "",
                root: "parent",
                variables: [
                    {
                        variable: "--border-color",
                        set: "var(--ion-color-danger)",
                        unset: "var(--ion-color)"
                    }
                ]
            }
        ]
    }
}

/**
 * Maps prop names to their custom validation
 * @param {string} prop
 * @param {*} value
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const propToError = function(prop, value){
    switch (prop){
        case SUB_TYPES.TIN:
            return tinHasErrors(value);
        default:
            break;
    }
}

/**
 * Validates a pattern
 * @param {string} text
 * @param {pattern} pattern in the '//' notation
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const patternHasErrors = function(text, pattern){
    if (!text) return;
    if (!pattern.test(text))
        return "Field does not match pattern";
}

/**
 * @param {string} email
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const emailHasErrors = function(email){
    if (patternHasErrors(email, /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
        return "Invalid email";
}

/**
 * Validates a tin number
 * @param {string|number} tin
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const tinHasErrors = function(tin){
    if (!tin) return;
    tin = tin + '';
    if (patternHasErrors(tin,/^\d{9}$/))
        return "Not a valid Tin";
}

/**
 * Validates a number Field (only integers supported)
 * @param {number} value
 * @param props
 */
const numberHasErrors = function(value, props){
    if (props[ION_CONST.name_key] === SUB_TYPES.TIN)
        return tinHasErrors(value);
    let {max, min} = props;
    if (value > max)
        return `The maximum is ${max}`;
    if (value < min)
        return `The minimum is ${min}`;
}

/**
 * Validates a date value
 * @param {Date} date
 * @param props
 */
const dateHasErrors = function(date, props){
    throw new Error("Not implemented date validation");
}

/**
 * Validates a text value
 * @param {string} text
 * @param props
 */
const textHasErrors = function(text, props){
    if (props[ION_CONST.name_key] === SUB_TYPES.TIN)
        return tinHasErrors(text);
}

/**
 * parses the numeric values
 * @param props
 */
const parseNumeric = function(props){
    let prop;
    try{
        for (prop in props)
            if (props.hasOwnProperty(prop) && props[prop])
                if ([ION_CONST.max_length, ION_CONST.max_value, ION_CONST.min_length, ION_CONST.min_value].indexOf(prop) !== -1)
                    props[prop] = parseInt(props[prop]);
    } catch (e){
        throw new Error(`Could not parse numeric validations attributes for field ${props.name} prop: ${prop}`);
    }
    return props;
}

/**
 * Parses the supported attributes in the element
 * @param {HTMLElement} element
 * @return the object of existing supported attributes
 */
const getValidationAttributes = function(element){
    return {
        type: element[ION_CONST.type_key],
        name: element[ION_CONST.name_key],
        required: element[ION_CONST.required_key],
        max: element[ION_CONST.max_value],
        maxlength: element[ION_CONST.max_length],
        min: element[ION_CONST.min_value],
        minlength: element[ION_CONST.max_length]
    };
}

/**
 * Validates a ion-input element for required & max/min length.
 * @param {HTMLElement} element
 * @param {object} props
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const hasRequiredAndLengthErrors = function(element, props){
    let {required, maxLength, minLength} = props;
    let value = element.value;
    value = value ? value.trim() : value;
    if (required && !value)
        return "Field is required";
    if (!value) return;
    if (minLength && value.length < minLength)
        return `The minimum length is ${minLength}`;
    if (maxLength && value.length > maxLength)
        return `The maximum length is ${minLength}`;
}

/**
 *
 * @param props
 * @param prefix
 * @return {boolean}
 */
const testInputEligibility = function(props, prefix){
    return !(!props[ION_CONST.name_key] || !props[ION_CONST.type_key] || props[ION_CONST.name_key].indexOf(prefix) === -1);
}

/**
 * Test a specific type of Ionic input field for errors
 *
 * should (+/-) match the ion-input type property
 *
 * supported types:
 *  - email;
 *  - tin
 *  - text
 *  - number
 *
 * @param {HTMLElement} element the ion-input field
 * @param {string} prefix the prefix for the ion-input to be validated
 */
const hasIonErrors = function(element, prefix){
    let props = getValidationAttributes(element);
    if (!testInputEligibility(props, prefix))
        throw new Error(`input field ${element} with props ${props} does not meet criteria for validation`);
    props[ION_CONST.name_key] = props[ION_CONST.name_key].substring(prefix.length);
    let errors = hasRequiredAndLengthErrors(element, props);
    if (errors)
        return errors;

    let value = element.value;
    switch (props[ION_CONST.type_key]){
        case ION_TYPES.EMAIL:
            errors = emailHasErrors(value);
            break;
        case ION_TYPES.DATE:
            errors = dateHasErrors(value, props);
            break;
        case ION_TYPES.NUMBER:
            props = parseNumeric(props);
            errors = numberHasErrors(value, props);
            break;
        case ION_TYPES.TEXT:
            errors = textHasErrors(value, props);
            break;
        default:
            errors = undefined;
    }

    return errors;
}

/**
 * Until I get 2way data binding to work on ionic components, this solves it.
 *
 * It validates the fields via their ion-input supported properties for easy integration if they ever work natively
 *
 * If the input's value has changed, an event called 'input-has-changed' with the input name as data
 *
 * @param {WebcController} controller
 * @param {HTMLElement} element the ion-input element
 * @param {string} prefix prefix to the name of the input elements
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const updateModelAndGetErrors = function(controller, element, prefix){
    if (!controller.model)
        return;
    let name = element.name.substring(prefix.length);
    if (typeof controller.model[name] === 'object') {
        let valueChanged = controller.model[name].value !== element.value;
        controller.model[name].value = element.value;
        if (valueChanged){
            const hasErrors = hasIonErrors(element, prefix);
            controller.model[name].error = hasErrors;
            updateStyleVariables(controller, element, hasErrors);
            controller.send('input-has-changed', name);
            return hasErrors;
        }
        return controller.model[name].error;
    }
}

/**
 * Manages the inclusion/exclusion of the error variables according to {@link ION_CONST#error#variables} in the element according to the selected {@link ION_CONST#error#append}
 * @param {WebcController} controller
 * @param {HTMLElement} element
 * @param {string} hasErrors
 */
const updateStyleVariables = function(controller, element, hasErrors){
    let el, selected, q;
    const getRoot = function(root) {
        let elem;
        switch (root) {
            case QUERY_ROOTS.parent:
                elem = element.parentElement;
                break;
            case QUERY_ROOTS.self:
                elem = element;
                break;
            case QUERY_ROOTS.controller:
                elem = controller.element;
                break;
            default:
                throw new Error("Unsupported Error style strategy");
        }
        return elem;
    }
    const queries = ION_CONST.error.queries;

    queries.forEach(query => {
        q = query.query.replace('${name}', element.name);
        el = getRoot(query.root);
        selected = q ? el.querySelectorAll(q) : [el];
        selected.forEach(s => {
            query.variables.forEach(v => {
                s.style.setProperty(v.variable, hasErrors ? v.set : v.unset)
            });
        });
    });
}

/**
 * iterates through all supported inputs and calls {@link updateModelAndGetErrors} on each.
 *
 * sends controller validation event
 * @param {WebcController} controller
 * @param {string} prefix
 * @return {boolean} if there are any errors in the model
 */
const controllerHasErrors = function(controller, prefix){
    let inputs = controller.element.querySelectorAll(`${ION_CONST.input_tag}[name^="${prefix}"]`);
    let errors = [];
    let error;
    inputs.forEach(el => {
        error = updateModelAndGetErrors(controller, el, prefix);
        if (error)
            errors.push(error);
    });
    let hasErrors = errors.length > 0;
    controller.send(hasErrors ? 'ion-model-is-invalid' : 'ion-model-is-valid');
    return hasErrors;
}

/**
 * When using ionic input components, this binds the controller for validation purposes.
 *
 * Inputs to be eligible for validation need to be named '${prefix}${propName}' where the propName must
 * match the type param in {@link hasErrors} via {@link updateModelAndGetErrors}
 *
 * Gives access to the validateIonic method on the controller via:
 * <pre>
 *     controller.hasErrors();
 * </pre>
 * (returns true or false)
 *
 * where all the inputs are validated
 *
 * call this only after the setModel call for safety
 * @param {WebcController} controller
 * @param {function()} [onValidModel] the function to be called when the whole Controller model is valid
 * @param {function()} [onInvalidModel] the function to be called when any part of the model is invalid
 * @param {string} [prefix] the prefix for the ion-input to be validated. defaults to 'input-'
 */
const bindIonicValidation = function(controller, onValidModel, onInvalidModel, prefix){
    if (typeof onInvalidModel === 'string' || !onInvalidModel){
        prefix = onInvalidModel
        onInvalidModel = () => {
            const submitButton = controller.element.querySelector('ion-button[type="submit"]');
            if (submitButton)
                submitButton.disabled = true;
        }
    }
    if (typeof onValidModel === 'string' || !onValidModel){
        prefix = onValidModel
        onValidModel = () => {
            const submitButton = controller.element.querySelector('ion-button[type="submit"]');
            if (submitButton)
                submitButton.disabled = false;
        }
    }

    prefix = prefix || 'input-';
    controller.on('ionChange', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        let element = evt.srcElement;
        if (!element.name) return;
        let errors = updateModelAndGetErrors(controller, element, prefix);
        if (errors)     // one fails, all fail
            controller.send('ion-model-is-invalid');
        else            // Now we have to check all of them
            controllerHasErrors(controller, prefix);
    });

    controller.hasErrors = () => controllerHasErrors(controller, prefix);

    controller.on('ion-model-is-valid', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (onValidModel)
            onValidModel.apply(controller);
    });

    controller.on('ion-model-is-invalid', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (onInvalidModel)
            onInvalidModel.apply(controller);
    });
}

/**
 * Validates a Model element according to prop names
 * *Does not validate 'required' or more complex attributes yet*
 * TODO use annotations to accomplish that
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const modelHasErrors = function(model){
    let error;
    for (let prop in model)
        if (model.hasOwnProperty(prop)){
            if (prop in Object.values(ION_TYPES) || prop in Object.values(SUB_TYPES))
                error = propToError(prop, model[prop]);
            if (error)
                return error;
        }
}

/**
 * Provides the implementation for the Model to be validatable alongside Ionic components
 * via the {@link hasErrors} method
 * @interface
 */
class Validatable{
    /**
     * @see {modelHasErrors}
     */
    hasErrors(){
        return modelHasErrors(this);
    }
}

module.exports = {
    Validatable,
    bindIonicValidation,
    emailHasErrors,
    tinHasErrors,
    textHasErrors,
    numberHasErrors
};
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\DSUService.js":[function(require,module,exports){
/**
 * @module services
 */

/**
 *
 */
const utils = require("./utils.js");

const doPost = utils.getPostHandlerFor("dsu-wizard");

if (utils.getEnv() === 'nodejs')
    FormData = require('form-data');    // needed because nodejs does not have FormData. his makes sure we can use it in tests

/**
 * Class responsible for Authenticated DSU transactions between the client and the API Hub
 * @class DSUService
 */
class DSUService {
    constructor() {
        let openDSU = require('opendsu');
        let crypto = openDSU.loadApi("crypto");
        let http = openDSU.loadApi("http");
        this.keyssiSpace = openDSU.loadApi('keyssi');

        // http.registerInterceptor((data, callback)=>{
        //     let {url, headers} = data;
        //     let scope = "";
        //
        //     if(typeof this.holderInfo != "undefined"){
        //         crypto.createPresentationToken(this.holderInfo.ssi, scope, this.credential, (err, presentationToken)=>{
        //             if(err){
        //                 return callback(err);
        //             }
        //
        //             headers["Authorization"] = presentationToken;
        //             return callback(undefined, {url, headers});
        //         });
        //     }else {
        //         console.log("Unexpected case");
        //         return callback(undefined, {url, headers});
        //     }
        //
        // });
    }

    // ensureHolderInfo(callback) {
    //     function getJSON(pth, callback){
    //         scriptUtils.fetch(pth).then((response) => {
    //             return response.json();
    //         }).then((json) => {
    //             return callback(undefined, json)
    //         }).catch(callback);
    //     }
    //
    //     if (typeof this.holderInfo === "undefined" || typeof this.credential === "undefined") {
    //         getJSON("/download/myKeys/holder.json", (err, holderInfo) => {
    //             if (err) {
    //                 return callback(Error("No holder info available!"));
    //             }
    //             this.holderInfo = holderInfo;
    //
    //             getJSON("/download/myKeys/credential.json", (err, result) => {
    //                 if (err) {
    //                     return callback(Error("No credentials available!"));
    //                 }
    //                 this.credential = result.credential;
    //                 return callback(undefined, holderInfo);
    //             });
    //         });
    //     } else {
    //         callback(undefined, this.holderInfo);
    //     }
    // }

    /**
     * This callback is displayed as part of the DSUService class.
     * @callback DSUService~callback
     * @param {string|object|undefined} error
     * @param {string|undefined} [keySSI]: not in human readable form
     */

    /**
     * This function is called by DSUService class to initialize/update DSU Structure.
     * @callback DSUService~modifier
     * @param {DSUBuilder} dsuBuilder
     * @param {DSUService~callback} callback
     */

    /**
     * Creates a DSU and initializes it via the provided initializer
     * @param {string} domain: the domain where the DSU is meant to be stored
     * @param {string|object} keySSIOrEndpoint: the keySSI string or endpoint object {endpoint: 'gtin', data: 'data'}
     * @param {DSUService~modifier} initializer: a method with arguments (dsuBuilder, callback)
     * <ul><li>the dsuBuilder provides the api to all operations on the DSU</li></ul>
     * @param {DSUService~callback} callback: the callback function
     */
    create(domain, keySSIOrEndpoint, initializer, callback){
        let self = this;
        let simpleKeySSI = typeof keySSIOrEndpoint === 'string';

        self.getTransactionId(domain, (err, transactionId) => {
            if (err)
                return callback(err);

            let afterKeyCb = function(err){
                if (err)
                    return callback(err);

                initializer(self.bindToTransaction(domain, transactionId), err => {
                    if (err)
                        return callback(err);
                    self.buildDossier(transactionId, domain, (err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, self.keyssiSpace.parse(keySSI));
                    });
                });
            };

            if (simpleKeySSI){
                self.setKeySSI(transactionId, domain, keySSIOrEndpoint, afterKeyCb);
            } else {
                self.setCustomSSI(transactionId, domain, keySSIOrEndpoint.endpoint, keySSIOrEndpoint.data, afterKeyCb);
            }
        });
    }

    /**
     * Creates a DSU and initializes it via the provided initializer
     * @param {string} domain: the domain where the DSU is meant to be stored
     * @param {keySSI} keySSI:
     * @param {DSUService~modifier} modifier: a method with arguments (dsuBuilder, callback)
     * <ul><li>the dsuBuilder provides the api to all operations on the DSU</li></ul>
     * @param {DSUService~callback} callback: the callback function
     */
    update(domain, keySSI, modifier, callback){
        let self = this;
        self.getTransactionId(domain, (err, transactionId) => {
           if (err)
               return callback(err);
           self.setKeySSI(transactionId, domain, keySSI, err =>{
               if (err)
                   return callback(err);
               modifier(self.bindToTransaction(domain, transactionId), (err, keySSI) => {
                    if (err)
                        return callback(err);
                    callback(undefined, keySSI);
               });
           });
        });
    }

    /**
     * Binds the DSU<service to the transaction and outputs a DSUBuilder
     * @param {string} domain
     * @param {string} transactionId
     * @returns {DSUBuilder} the dsu builder
     */
    bindToTransaction(domain, transactionId){
        let self = this;
        /**
         * Wrapper class around DSUService with binded transactionId and domain
         */
        return new class DSUBuilder {
            /**
             * @see {@link DSUService#addFileDataToDossier} with already filled transactionId and domain
             * @module services
             */
            addFileDataToDossier(fileName, fileData, callback){
                self.addFileDataToDossier(transactionId, domain, fileName, fileData, callback);
            };
            /**
             * @see {@link DSUService#mount} with already filled transactionId and domain
             * @module services
             */
            mount(path, seed, callback){
                self.mount(transactionId, domain, path, seed, callback);
            };
        }
    }

    getTransactionId(domain, callback) {

        let obtainTransaction = ()=>{
            doPost(`/${domain}/begin`, '',(err, transactionId) => {
                if (err)
                    return callback(err);

                return callback(undefined, transactionId);
            });
        }

        // this.ensureHolderInfo( (err)=>{
        //     if(err){
        //         return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Holder missconfiguration in the wallet", err));
        //     }
            obtainTransaction();
        // });
    }

    setKeySSI(transactionId, domain, keyssi, callback) {
        const url = `/${domain}/setKeySSI/${transactionId}`;
        doPost(url, keyssi, callback);
    }

    setCustomSSI(transactionId, domain, endpoint, data, callback){
        const url = `/${domain}/${endpoint}/${transactionId}`;
        doPost(url, JSON.stringify(data), callback);
    }

    addFileDataToDossier(transactionId, domain, fileName, fileData, callback) {
        const url = `/${domain}/addFile/${transactionId}`;

        if (fileData instanceof ArrayBuffer) {
            fileData = new Blob([new Uint8Array(fileData)], {type: "application/octet-stream"});
        }
        let body = new FormData();
        let inputType = "file";
        body.append(inputType, fileData);

        doPost(url, body, {headers: {"x-dossier-path": fileName}}, callback);
    }

    mount(transactionId, domain, path, seed, callback) {
        const url = `/${domain}/mount/${transactionId}`;
        doPost(url, "", {
            headers: {
                'x-mount-path': path,
                'x-mounted-dossier-seed': seed
            }
        }, callback);
    }

    buildDossier(transactionId, domain, callback) {
        const url = `/${domain}/build/${transactionId}`;
        doPost(url, "", callback);
    }
}

module.exports = DSUService;

},{"./utils.js":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js","form-data":false,"opendsu":false}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\WebcLocaleService.js":[function(require,module,exports){
/**
 * @module locale
 */

/**
 * This service depends on WebCardinal's translation API
 *
 * Integrates with {@link WebCardinal}'s translation model, and natively integrates into controllers and their model
 */
function LocaleService(){
    if (!WebCardinal)
        throw new Error("Could not find WebCardinal");

    const supported = [];

    const getLocale = () => WebCardinal.language;

    const setLocale = (locale) => {
        if (!(locale in supported))
            throw new Error("Provided locale not supported");
        WebCardinal.language = locale;
        this.loadLocale();
    }

    const _genSupported = () => {
        Object.keys(WebCardinal.translations).forEach(a => {
            supported.push(a);
        })
    };

    _genSupported();

    /**
     * Loads the current locale
     */
    this._loadLocale = function(controller){
        return controller.translationModel;
    }

    /**
     *
     * @param model
     * @param translationKey
     * @return {*}
     */
    const parseTranslationModel = function(model, translationKey){
        const index = translationKey.indexOf('.');
        if (index === -1)
            return model[translationKey];

        return this.parseTranslationModel(model[translationKey.substring(0, translationKey.indexOf('.'))],
            translationKey.substring(index + 1));
    }

    /**
     * Retrieves the translation information from WebCardinal
     * @param {string} pageName if contains '.' it will be translated into hierarchy in json object (just one level currently supported)
     * @param {WebcController} controller
     * @returns {object} the translation object for the provided page in the current language
     */
    this.getByPage = function(pageName, controller){
        let locale = this._loadLocale(controller);
        if (!locale){
            console.log("no locale set");
            return {};
        }

        locale = locale.toObject();
        if (!pageName)
            return locale;
        if (pageName.includes("."))
            return parseTranslationModel(locale, pageName);
        return locale[pageName];
    }
}

/**
 * Util function to merge JSON objects according to a specified priority
 */
const merge = function(target, source){
    for (const key of Object.keys(source))
        if (source[key] instanceof Object)
            Object.assign(source[key], merge(target[key] ? target[key] : {}, source[key]))
    Object.assign(target || {}, source)
    return target;
}

/**
 * Binds the translation model to the controller and its setModel method
 */
const bindToController = function(controller, page){
    if (!controller.localized) {
        let getter = controller.getModel;
        controller.getModel = () => {
            let locale = localeService.getByPage(page, controller);
            if (!locale){
                console.log(`No translations found for page ${page}`);
                return getter();
            }
            locale = JSON.parse(JSON.stringify(locale));
            let model = getter();
            return merge(locale, model);
        };
        controller.localized = true;
    }
}

let localeService;

module.exports = {
    /**
     * Returns the instance of the LocaleService and binds the locale info to the controller via {@link bindToController}
     * @param {WebcController} controller: the current controller
     * @param {string} page: the name of the view. Must match an existing key in {@link WebCardinal#translations}
     * @returns {LocaleService}
     */
    bindToLocale: function (controller, page){
        if (!localeService)
            localeService = new LocaleService();
        bindToController(controller, page);
        return localeService;
    }
}
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\strategy.js":[function(require,module,exports){
/**
 * DSU creation strategies:
 *  - **Simple:** Users the direct OpenDSU API. Only works if the APIHub is not in authorized mode;
 *  - **Authorized:** Uses the DSUFabric and {@link DSUBuilder} to ensure transactions and permissions
 * @module services
 */
const STRATEGY = {
    AUTHORIZED: "authorized",
    SIMPLE: "simple"
}

module.exports = STRATEGY;
},{}],"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\utils.js":[function(require,module,exports){
/**
 * @module utils
 */

/**
 * Provides Util functions and Methods as well as caching for the open DSU resolver and {@Link DSUBuilder}
 */

let resolver, DSUService, keyssi;

/**
 * util function to get the env type.
 * Needs openDSU to be loaded to have access to $$ regardless of environment
 * @return {string} the environment type - nodejs or
 */
function getEnv(){
	return $$.environmentType;
}

/**
 * for singleton use
 * @returns {function} resolver
 */
function getResolver(){
	if (!resolver)
		resolver = require('opendsu').loadApi('resolver');
	return resolver;
}

/**
 * for singleton use
 * @returns {function} resolver
 */
function getKeySSISpace(){
	if (!keyssi)
		keyssi = require('opendsu').loadApi('keyssi');
	return keyssi;
}

/**
 * for singleton use
 * @returns {DSUService}
 */
function getDSUService(){
	if (!DSUService)
		DSUService = new (require('./DSUService'));
	return DSUService;
}

/**
 * Convenience method to select the appropriate resolver method to use depending on the key
 * @param keySSI
 * @returns {function} the appropriate resolver method for creating dsus {@link resolver#createDSU}/{@link resolver#createDSUForExistingSSI}
 */
function selectMethod(keySSI){
	if (['array', 'const'].indexOf(keySSI.getTypeName()) > -1)
		return getResolver().createDSUForExistingSSI;
	return getResolver().createDSU;
}

/**
 * Util method to recursively create folders from a list.
 * Useful to create mount folders
 * @param {Archive} dsu
 * @param {string[]} folders
 * @param {function(err, string[])} callback the folders there where actually created (didn't already exist)
 */
function createDSUFolders(dsu, folders, callback){
	let created = [];
	let iterator = function(folderList){
		let folder = folderList.shift();
		if (!folder)
			return callback(undefined, created);
		dsu.readDir(folder, (err, files) => {
			if (!err) {
				console.log(`Found already existing folder at ${folder}. No need to create...`)
				return iterator(folderList);
			}
			dsu.createFolder(folder, (err) => {
				if (err)
					return callback(err);
				created.push(folder);
				iterator(folderList);
			});
		});
	}
	iterator(folders.slice());
}

/**
 * Util Method to select POST strategy per DSU api.
 * - Forked from PrivateSky
 * - refactored for server side use compatibility
 * @param {string} apiname
 * @returns {doPost} postHandler
 */
function getPostHandlerFor(apiname){

	function getBaseURL() {
		//opendsu.loadApi('system').getEnvironmentVariable(opendsu.constants.BDNS_ROOT_HOSTS);

		let protocol, host, port;
		try {
			protocol = window.location.protocol;
			host = window.location.hostname;
			port = window.location.port;

		} catch (e){
			// Only used in tests
			if (process.env.BDNS_ROOT_HOSTS)
				return `${process.env.BDNS_ROOT_HOSTS}/${apiname}`;
			protocol = "http:";
			host = "localhost";
			port = "8080";
		}

		return `${protocol}//${host}:${port}/${apiname}`;
	}

	function doPost(url, data, options, callback) {
		const http = require("opendsu").loadApi("http");
		if (typeof options === "function") {
			callback = options;
			options = {};
		}

		if (typeof data === "function") {
			callback = data;
			options = {};
			data = undefined;
		}

		const baseURL = getBaseURL();
		url = `${baseURL}${url}#x-blockchain-domain-request`
		http.doPost(url, data, options, (err, response) => {
			if (err)
				return callback(err);
			callback(undefined, response);
		});
	}
	return doPost;
}

module.exports = {
	getResolver,
	getKeySSISpace,
	getDSUService,
	getPostHandlerFor,
	selectMethod,
	createDSUFolders,
	getEnv
}

},{"./DSUService":"C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\pdm-dsu-toolkit\\services\\DSUService.js","opendsu":false}]},{},["C:\\xampp\\htdocs\\Pharmaledger\\csc-workspace-main\\fgt-dsu-wizard\\builds\\tmp\\wizard_intermediar.js"])
                    ;(function(global) {
                        global.bundlePaths = {"wizard":"build\\bundles\\wizard.js"};
                    })(typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
                