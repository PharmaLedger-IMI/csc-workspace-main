const opendsu = require('opendsu');
const resolver = opendsu.loadAPI('resolver');
const storage = opendsu.loadApi('storage');
const keySSISpace = opendsu.loadAPI('keyssi');
class DSUService {
  PATH = '/';
  DATA_FILE = 'data.json';
  dsuServiceIsReady = false;
  onReadyCallbacks = [];

  constructor(path = this.PATH) {
    this.DSUStorage = storage.getDSUStorage();
    this.PATH = path;

    this.DSUStorage.enableDirectAccess(() => {
      this.dsuServiceIsReady = true;
      while (this.onReadyCallbacks.length > 0) {
        let callback = this.onReadyCallbacks.shift();
        callback();
      }
    });
  }

  onReady(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback should be a function');
    }
    if (this.dsuServiceIsReady) {
      return callback();
    }
    this.onReadyCallbacks.push(callback);
  }

  getEntities(path, callback) {
    [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
    this.DSUStorage.listMountedDossiers(path, (err, dsuList) => {
      if (err) {
        return callback(err, undefined);
      }
      let entities = [];
      let getServiceDsu = (dsuItem) => {
        this.DSUStorage.getItem(this._getDsuStoragePath(dsuItem.identifier, path), (err, content) => {
          if (err) {
            entities.slice(0);
            return callback(err, undefined);
          }
          let textDecoder = new TextDecoder('utf-8');
          let entity = JSON.parse(textDecoder.decode(content));
          entities.push(entity);
          if (dsuList.length === 0) {
            return callback(undefined, entities);
          }
          getServiceDsu(dsuList.shift());
        });
      };
      if (dsuList.length === 0) {
        return callback(undefined, []);
      }
      getServiceDsu(dsuList.shift());
    });
  }

  async getEntitiesAsync(path) {
    return this.asyncMyFunction(this.getEntities, [...arguments]);
  }

  getEntity(uid, path, callback) {
    [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
    this.DSUStorage.getItem(this._getDsuStoragePath(uid, path), (err, content) => {
      if (err) {
        return callback(err, undefined);
      }
      let textDecoder = new TextDecoder('utf-8');
      callback(undefined, JSON.parse(textDecoder.decode(content)));
    });
  }

  async getEntityAsync(uid, path) {
    return this.asyncMyFunction(this.getEntity, [...arguments]);
  }

  getEntityPath(keySSI, pathPrefix, callback){
    this.DSUStorage.listMountedDSUs(pathPrefix, (err, dsuList) => {
      const dsu  = dsuList.find(dsu=>dsu.identifier === keySSI);
      if(!dsu){
        return callback(undefined, keySSI);
      }
      callback(undefined,dsu.path);
    });
  }

  async getEntityPathAsync(knownIdentifier, pathPrefix){
    return this.asyncMyFunction(this.getEntityPath, [...arguments]);
  }

  saveEntity(entity, path, callback) {
    [path, callback] = this.swapParamsIfPathIsMissing(path, callback);

    const config = opendsu.loadAPI('config');

    config.getEnv('domain', (err, domain) => {
      if (err || !domain) {
        domain = 'default';
      }

      const templateSSI = keySSISpace.createTemplateSeedSSI(domain);
      resolver.createDSU(templateSSI, (err, dsuInstance) => {
        if (err) {
          console.log(err);
          return callback(err);
        }


        dsuInstance.getKeySSIAsString((err, seedSSI) => {
          if (err) {
            return callback(err);
          }

          const keySSIObj = keySSISpace.parse(seedSSI);
          const anchorId = keySSIObj.getAnchorId();

          dsuInstance.getKeySSIAsString('sread', (err, sreadSSI) => {
            if (err) {
              return callback(err);
            }

            this.DSUStorage.mount(path + '/' + anchorId, seedSSI, (err) => {
              if (err) {
                console.log(err);
              }
              entity.uid = anchorId;

              this.updateEntity(entity, path, (err, entity) => {
                if (err) {
                  return callback(err, entity);
                }

                entity.keySSI = seedSSI;
                entity.sReadSSI = sreadSSI;
                callback(undefined, entity);
              });

            });
          });
        });
      });

    });
  }

  async saveEntityAsync(entity, path) {
    return this.asyncMyFunction(this.saveEntity, [...arguments]);
  }

  updateEntity(entity, path, callback) {
    [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
    this.DSUStorage.setObject(this._getDsuStoragePath(entity.uid, path), entity, (err) => {
      if (err) {
        return callback(err, undefined);
      }
      callback(undefined, entity);
    });
  }

  async updateEntityAsync(entity, path) {
    return this.asyncMyFunction(this.updateEntity, [...arguments]);
  }

  mountEntity(keySSI, path, callback) {
    [path, callback] = this.swapParamsIfPathIsMissing(path, callback);

    const keySSIObj = keySSISpace.parse(keySSI);
    const anchorId = keySSIObj.getAnchorId();
    this.DSUStorage.mount(path + '/' + anchorId, keySSI, (err) => {
      this.getEntity(anchorId, path, (err, entity) => {
        if (err) {
          return callback(err, undefined);
        }
        callback(undefined, entity);
      });
    });
  }

  async mountEntityAsync(keySSI, path) {
    return this.asyncMyFunction(this.mountEntity, [...arguments]);
  }

  unmountEntity(uid, path, callback) {
    [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
    let unmountPath = path + '/' + uid;
    this.DSUStorage.unmount(unmountPath, (err, result) => {
      if (err) {
        return callback(err, undefined);
      }
      callback(undefined, result);
    });
  }

  async unmountEntityAsync(uid, path) {
    return this.asyncMyFunction(this.unmountEntity, [...arguments]);
  }

  _getDsuStoragePath(keySSI, path = this.PATH) {
    return `${path}/${keySSI}/${this.DATA_FILE}`;
  }

  swapParamsIfPathIsMissing(path, callback) {
    return typeof path === 'function' ? [this.PATH, path] : [path, callback];
  }

  readFile(path, callback) {
    [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
    this.DSUStorage.readFile(path, (err, data) => {
      if (err) {
        return callback(err, undefined);
      }
      return callback(null, data);
    });
  }

  async readFileAsync(path) {
    return this.asyncMyFunction(this.readFile, [...arguments]);
  }

  //TODO: use $$.promisify
  asyncMyFunction = (func, params) => {
    func = func.bind(this);
    return new Promise((resolve, reject) => {
      func(...params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  };

  getUidFromSSI(ssi){
    const ssiObj = keySSISpace.parse(ssi);
    return ssiObj.getAnchorId();
  }
}

module.exports = DSUService;
