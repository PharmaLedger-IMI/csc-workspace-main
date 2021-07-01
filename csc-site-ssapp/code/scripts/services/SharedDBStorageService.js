const KEYSSI_FILE_PATH = 'keyssi.json';
const SHARED_DB = 'sharedDB';

const keySSISpace = require('opendsu').loadApi('keyssi');

class SharedStorage {
  dbInit = false;

  constructor(dsuStorage) {
    this.DSUStorage = dsuStorage;
    // this.DSUStorage.enableDirectAccess(() => { // XXX: what this does?
    this.init();
    // });
  }

  async init() {
    try {
      this.myDb = 'initializing';
      const sharedSSI = await this.getSharedSSI();
      let db = require('opendsu').loadAPI('db');
      this.myDb = db.getWalletDB(sharedSSI, SHARED_DB);
      this.myDb.on('initialised', () => {
        this.dbInit = true;
      });
    } catch (error) {
      console.log(error);
    }
  }

  waitForDb(func, args) {
    func = func.bind(this);
    setTimeout(function () {
      () => {
        func(...args);
      };
    }, 2000);
  }

  dbReady() {
    return this.myDb !== undefined && this.myDb !== 'initializing';
  }

  filter(tableName, query, sort, limit) {
    return new Promise((resolve, reject) => {
      const waitForDb = function () {
        if (this.dbInit) {
          this.myDb.filter(tableName, query, sort, limit, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
            return;
          });
        } else {
          setTimeout(() => {
            waitForDb();
            return;
          }, 30);
        }
      }.bind(this);
      waitForDb();
    });
  }

  addSharedFile(path, value) {
    throw Error('Not implemented');
  }

  getRecord(tableName, key) {
    return new Promise((resolve, reject) => {
      const waitForDb = function () {
        if (this.dbInit) {
          this.myDb.getRecord(tableName, key, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
            return;
          });
        } else {
          setTimeout(() => {
            waitForDb();
            return;
          }, 30);
        }
      }.bind(this);
      waitForDb();
    });
  }

  insertRecord(tableName, key, record) {
    return new Promise((resolve, reject) => {
      const waitForDb = function () {
        if (this.dbInit) {
          this.myDb.insertRecord(tableName, key, record, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
            return;
          });
        } else {
          setTimeout(() => {
            waitForDb();
            return;
          }, 30);
        }
      }.bind(this);
      waitForDb();
    });
  }

  updateRecord(tableName, key, record) {
    return new Promise((resolve, reject) => {
      const waitForDb = function () {
        if (this.dbInit) {
          this.myDb.updateRecord(tableName, key, record, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
            return;
          });
        } else {
          setTimeout(() => {
            waitForDb();
            return;
          }, 30);
        }
      }.bind(this);
      waitForDb();
    });
  }

  beginBatch() {
    if (this.dbReady()) {
      this.myDb.beginBatch();
    } else {
      this.waitForDb(this.beginBatch);
    }
  }

  cancelBatch(callback) {
    if (this.dbReady()) {
      this.myDb.cancelBatch(callback);
    } else {
      this.waitForDb(this.cancelBatch, [callback]);
    }
  }

  commitBatch(callback) {
    if (this.dbReady()) {
      this.myDb.commitBatch(callback);
    } else {
      this.waitForDb(this.commitBatch, [callback]);
    }
  }

  async getSharedSSI() {
    const fileList = await this.listFiles('/');
    if (fileList.includes(KEYSSI_FILE_PATH)) {
      const data = await this.getItem(KEYSSI_FILE_PATH);
      const parsed = keySSISpace.parse(data.sharedSSI);
      return parsed;
    } else {
      const keyssi = await this.createSharedSSI();
      return keyssi;
    }
  }

  async createSharedSSI() {
    const ssi = keySSISpace.createSeedSSI('default');
    await this.setItem(KEYSSI_FILE_PATH, { sharedSSI: ssi.derive().getIdentifier() });
    return ssi;
  }

  getItem(path) {
    return new Promise((resolve, reject) => {
      this.DSUStorage.getItem(path, (err, content) => {
        if (err) {
          reject(new Error(err));
          return;
        }
        let textDecoder = new TextDecoder('utf-8');
        let json = JSON.parse(textDecoder.decode(content));
        resolve(json);
      });
    });
  }

  setItem(path, content) {
    return new Promise((resolve, reject) => {
      this.DSUStorage.setObject(path, content, async (err) => {
        if (err) {
          reject(new Error(err));
          return;
        }
        resolve(content);
      });
    });
  }

  listFiles(path) {
    return new Promise((resolve, reject) => {
      this.DSUStorage.call('listFiles', path, async (err, result) => {
        if (err) {
          console.log(err);
          reject(new Error(err));
          return;
        }
        resolve(result);
      });
    });
  }
}

export default function getSharedStorage(dsuStorage) {
  if (typeof window.sharedStorageSingleton === 'undefined') {
    window.sharedStorageSingleton = new SharedStorage(dsuStorage);
  }

  return window.sharedStorageSingleton;
}
