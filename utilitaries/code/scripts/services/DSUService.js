export default class DSUService {

    PATH = "/";

    constructor(DSUStorage, path = this.PATH) {
        this.DSUStorage = DSUStorage;
        this.PATH = path;
    }

    getEntities(path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.DSUStorage.call('listDSUs', path, (err, dsuList) => {
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
                    let textDecoder = new TextDecoder("utf-8");
                    let entity = JSON.parse(textDecoder.decode(content));
                    entities.push(entity);

                    if (dsuList.length === 0) {
                        return callback(undefined, entities);
                    }
                    getServiceDsu(dsuList.shift());
                })
            };

            if (dsuList.length === 0) {
                return callback(undefined, []);
            }
            getServiceDsu(dsuList.shift());
        })
    }

    async getEntitiesAsync(path) {
        return this.asyncMyFunction(this.getEntities, [...arguments])
    }

    getEntity(uid, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.DSUStorage.getItem(this._getDsuStoragePath(uid, path), (err, content) => {
            if (err) {
                return callback(err, undefined);
            }
            let textDecoder = new TextDecoder("utf-8");
            callback(undefined, JSON.parse(textDecoder.decode(content)));
        })
    }

    async getEntityAsync(uid, path) {
        return this.asyncMyFunction(this.getEntity, [...arguments])
    }

    saveEntity(entity, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.DSUStorage.call('createSSIAndMount', path, (err, keySSI) => {
            if (err) {
                return callback(err, undefined);
            }
            // TODO: Decide the name of the identifier and remove the others.
            entity.KeySSI = keySSI;
            entity.keySSI = keySSI;
            entity.uid = keySSI;
            this.updateEntity(entity, path, callback);
        })
    }

    async saveEntityAsync(entity, path) {
        return this.asyncMyFunction(this.saveEntity, [...arguments])
    }

    updateEntity(entity, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.DSUStorage.setObject(this._getDsuStoragePath(entity.uid, path), entity, (err) => {
            if (err) {
                return callback(err, undefined);
            }
            callback(undefined, entity);
        })
    }

    async updateEntityAsync(entity, path) {
        return this.asyncMyFunction(this.updateEntity, [...arguments])
    }

    mountEntity(keySSI, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.DSUStorage.call('mount', path, keySSI, (err) => {
            this.getEntity(keySSI, (err, entity) => {
                if (err) {
                    return callback(err, undefined);
                }
                callback(undefined, entity);
            })
        })
    }

    async mountEntityAsync(keySSI, path) {
        return this.asyncMyFunction(this.mountEntity, [...arguments])
    }

    unmountEntity(uid, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        let unmountPath = path + '/' + uid;
        this.DSUStorage.call('unmount', unmountPath, (err, result) => {
            if (err) {
                return callback(err, undefined);
            }
            callback(undefined, result);
        });
    }

    async unmountEntityAsync(uid, path) {
        return this.asyncMyFunction(this.unmountEntity, [...arguments])
    }

    _getDsuStoragePath(keySSI, path = this.PATH) {
        return path + '/' + keySSI + '/data.json';
    }

    swapParamsIfPathIsMissing(path, callback) {
        return typeof path === 'function' ? [this.PATH, path] : [path, callback];
    }

    asyncMyFunction = (func, params) => {
        func = func.bind(this)
        return new Promise((resolve, reject) => {
            func(...params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            })
        })
    }
}