require("../opendsu-sdk/psknode/bundles/openDSU");
openDSURequire('overwrite-require');
const opendsu = openDSURequire("opendsu");
const http = opendsu.loadApi("http");

//const BASE_URL = "http://localhost:8080";
const BASE_URL = "https://csc.rms.pharmaledger.app";
const dnsDomain = "pharmaledger.app";

const MAIN_DOMAIN = "csc";
const SUB_DOMAIN_BASE = "csc";
const VAULT_NAME_BASE = "vault";

const cloneMainDomain = "csc";
const cloneVaultDomain = "vault";

const CMO_ENV_TEMPLATE = 'export default { "companyName":"${companyName}", "appName": "CMO App", "appVersion": "0.1.1", "vault": "server", "agent": "browser", "system": "any", "browser": "any", "mode": "dev-secure", "domain": "${domain}", "didDomain": "${didDomain}", "vaultDomain": "${vaultDomain}", "enclaveType": "WalletDBEnclave", "sw": false, "pwa": false};'
const SITE_ENV_TEMPLATE = 'export default { "companyName":"${companyName}", "appName": "Site App", "appVersion": "0.1.1", "vault": "server", "agent": "browser", "system": "any", "browser": "any", "mode": "dev-secure", "domain": "${domain}", "didDomain": "${didDomain}", "vaultDomain": "${vaultDomain}", "enclaveType": "WalletDBEnclave", "sw": false, "pwa": false};';
const SPONSOR_ENV_TEMPLATE = 'export default { "companyName":"${companyName}", "appName": "Sponsor App", "appVersion": "0.1.1", "vault": "server", "agent": "browser", "system": "any", "browser": "any", "mode": "dev-secure", "domain": "${domain}", "didDomain": "${didDomain}", "vaultDomain": "${vaultDomain}", "enclaveType": "WalletDBEnclave", "sw": false, "pwa": false};';
const COURIER_ENV_TEMPLATE = 'export default { "companyName":"${companyName}", "appName": "Courier App", "appVersion": "0.1.1", "vault": "server", "agent": "browser", "system": "any", "browser": "any", "mode": "dev-secure", "domain": "${domain}", "didDomain": "${didDomain}", "vaultDomain": "${vaultDomain}", "enclaveType": "WalletDBEnclave", "sw": false, "pwa": false};';
const DEMIURGE_ENV_TEMPLATE = 'export default { "companyName":"${companyName}", "appName": "Demiurge", "appVersion": "0.1.1", "vault": "server", "agent": "browser", "system": "any", "browser": "any", "mode": "dev-secure", "domain": "${domain}", "didDomain": "${didDomain}", "vaultDomain": "${vaultDomain}", "enclaveType": "WalletDBEnclave", "sw": false, "pwa": false, "disabledFeatures": "add-group", "hiddenMenuItems": ["Governance", "Audit", "BDNS", "My Keys", "Workspaces", "Contracts", "Subdomains"]};';

const templates = {
  "/csc-cmo-wallet/loader/environment.js": CMO_ENV_TEMPLATE,
  "/csc-site-wallet/loader/environment.js": SITE_ENV_TEMPLATE,
  "/csc-sponsor-wallet/loader/environment.js": SPONSOR_ENV_TEMPLATE,
  "/csc-courier-wallet/loader/environment.js": COURIER_ENV_TEMPLATE,
  "/demiurge-wallet/loader/environment.js": DEMIURGE_ENV_TEMPLATE
};

const companies = ["nvs", "rms", "pdm", "certh"];
const companyNames = {
  "nvs":"Novartis",
  "rms":"RomSoft",
  "pdm":"PDM",
  "certh":"Certh"
}
function getCompanyDNSDomain(name) {
  return MAIN_DOMAIN + "." + name + "." + dnsDomain;
}

function getCompanySubDomain(name) {
  return SUB_DOMAIN_BASE + "." + name;
}

function getCompanyVaultDomain(name) {
  return VAULT_NAME_BASE + "." + name;
}

function getCompanyVars(companyIdentifier) {
  return {
    companyName: companyNames[companyIdentifier],
    mainDomain: MAIN_DOMAIN,
    domain:getCompanySubDomain(companyIdentifier),
    subDomain: getCompanySubDomain(companyIdentifier),
    didDomain: getCompanyVaultDomain(companyIdentifier),
    vaultDomain: getCompanyVaultDomain(companyIdentifier),
  };
}

async function storeVariable(dns, prop, value) {
  try {
    let doPost = $$.promisify(http.doPost);
    await doPost(`${BASE_URL}/admin/${MAIN_DOMAIN}/storeVariable`, JSON.stringify({
      "dnsDomain": dns,
      "variableName": prop,
      "variableContent": value
    }));
    console.log(`Finished storing variable ${prop}=${value} for ${dns}`);
  } catch (e) {
    console.trace(e);
    process.exit(1);
  }
}

async function createDomain(domainName, cloneFrom) {
  console.log("##",domainName, ",^^",cloneFrom);
  try {
    let doPost = $$.promisify(http.doPost);
    await doPost(`${BASE_URL}/admin/${MAIN_DOMAIN}/addDomain`, JSON.stringify({
      "domainName": domainName,
      "cloneFromDomain": cloneFrom
    }));
    console.log(`Finished createDomain ${domainName} based on ${cloneFrom}`);
  } catch (e) {
    console.trace(e);
    process.exit(1);
  }
}

async function registerTemplate(path, content) {
  try {
    let doPost = $$.promisify(http.doPost);
    await doPost(`${BASE_URL}/admin/${MAIN_DOMAIN}/registerTemplate`, JSON.stringify({
      path,
      content
    }));
    console.log(`Finished registering template for path ${path}`);
  } catch (e) {
    console.trace(e);
    process.exit(1);
  }
}

(async () => {

  for (let path in templates) {
    let content = templates[path];
    await registerTemplate(path, content);
  }

  let companyVars = {
    companyName: "rms",
    mainDomain: MAIN_DOMAIN,
    subDomain: MAIN_DOMAIN,
    didDomain: cloneVaultDomain,
    vaultDomain: cloneVaultDomain,
  };

  for (let prop in companyVars) {
    await storeVariable(getCompanyDNSDomain("rms"), prop, companyVars[prop]);
  }

  for (let i = 0; i < companies.length; i++) {
    let companyName = companies[i];

    await createDomain(getCompanySubDomain(companyName), cloneMainDomain);
    await createDomain(getCompanyVaultDomain(companyName), cloneVaultDomain);

    let companyDNS = getCompanyDNSDomain(companyName);
    let companyVars = getCompanyVars(companyName);
    for (let prop in companyVars) {
      await storeVariable(companyDNS, prop, companyVars[prop]);
    }
  }
})();