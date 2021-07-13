const securityContext = require('opendsu').loadApi('sc');
const mainDSU = securityContext.getMainDSU();

function createSSIAndMount(path, callback) {
  const opendsu = require('opendsu');
  const resolver = opendsu.loadAPI('resolver');
  const keySSISpace = opendsu.loadAPI('keyssi');

  const templateSSI = keySSISpace.createTemplateSeedSSI('default');
  resolver.createDSU(templateSSI, (err, dsuInstance) => {
    if (err) {
      console.log(err);
      return callback(err);
    }
    dsuInstance.getKeySSIAsString((err, keySSI) => {
      if (err) {
        return callback(err);
      }
      mainDSU.mount(path + '/' + keySSI, keySSI, (err) => {
        if (err) {
          console.log(err);
        }
        callback(err, keySSI);
      });
    });
  });
}

function mount(path, keySSI, callback) {
  mainDSU.mount(path + '/' + keySSI, keySSI, (err) => {
    if (err) {
      return callback(err);
    }
    callback(undefined);
  });
}

function unmount(path, callback) {
  mainDSU.unmount(path, callback);
}

function listDSUs(path, callback) {
  mainDSU.listMountedDossiers(path, callback);
}

function loadDSU(keySSI, callback) {
  const resolver = require('opendsu').loadAPI('resolver');
  resolver.loadDSU(keySSI, callback);
}

function readFile(path, callback) {
  mainDSU.readFile(path, callback);
}

function listFiles(path, callback) {
  mainDSU.listFiles(path, callback);
}

function listFolders(path, callback) {
  mainDSU.listFolders(path, callback);
}

module.exports = {
  createSSIAndMount,
  mount,
  listDSUs,
  loadDSU,
  unmount,
  readFile,
  listFiles,
  listFolders
};
