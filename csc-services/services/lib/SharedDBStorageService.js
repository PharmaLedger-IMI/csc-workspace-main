const KEYSSI_FILE_PATH = 'keyssi.json';
const SHARED_DB = 'sharedDB';

const keySSISpace = require('opendsu').loadApi('keyssi');

class SharedStorage {

  constructor(dsuStorage) {
    this.DSUStorage = dsuStorage;
    this.DSUStorage.enableDirectAccess(() => {
      this.mydb = 'initialising';
      this.getSharedSSI((err,sharedSSI) => {
        if (!err && sharedSSI) {
          let opendsu = require('opendsu');
          let db = opendsu.loadAPI('db');
          this.mydb = db.getWalletDB(sharedSSI, SHARED_DB);
        } else {
          alert('Wrong configuration as user:' + err);
        }
      });
    });
  }

  waitForDb(func, args) {
    if(typeof args === "undefined"){
      args = [];
    }
    func = func.bind(this)
    setTimeout(function () {
      func(...args);
    }, 10);
  }

  dbReady() {
    return (this.mydb !== undefined && this.mydb !== "initialising");
  }

  filter(tableName, query, sort, limit, callback) {
    if (this.dbReady()) {
      this.mydb.filter(tableName, query, sort, limit, callback);
    } else {
      this.waitForDb(this.filter, [tableName, query, sort, limit, callback]);
    }
  }

  addSharedFile(path, value) {
    throw Error('Not implemented');
  }

  getRecord(tableName, key, callback) {
    if (this.dbReady()) {
      this.mydb.getRecord(tableName, key, callback);
    } else {
      this.waitForDb(this.getRecord, [tableName, key, callback]);
    }
  }

  insertRecord(tableName, key, record, callback) {
    if (this.dbReady()) {
      console.log("Insert Record:", tableName, key);
      this.mydb.insertRecord(tableName, key, record, callback);
    } else {
      this.waitForDb(this.insertRecord, [tableName, key, record, callback]);
    }
  }

  updateRecord(tableName, key, record, callback) {
    if (this.dbReady()) {
      this.mydb.updateRecord(tableName, key, record, callback);
    } else {
      this.waitForDb(this.updateRecord, [tableName, key, record, callback]);
    }
  }

  beginBatch(){
    if (this.dbReady()) {
      this.mydb.beginBatch();
    } else {
      this.waitForDb(this.beginBatch);
    }
  }

  cancelBatch(callback){
    if (this.dbReady()) {
      this.mydb.cancelBatch(callback);
    } else {
      this.waitForDb(this.cancelBatch, [callback]);
    }
  }

  commitBatch(callback){
    if (this.dbReady()) {
      this.mydb.commitBatch(callback);
    } else {
      this.waitForDb(this.commitBatch, [callback]);
    }
  }

  getSharedSSI(callback) {
    this.DSUStorage.listFiles('/', (err, fileList) => {
      if (err) {
        return callback(err);
      }
      if (fileList.includes(KEYSSI_FILE_PATH)) {
        this.DSUStorage.getObject(KEYSSI_FILE_PATH, (err, data) => {
          if (err) {
            return callback(err);
          }
          const parsed = keySSISpace.parse(data.sharedSSI);
          callback(undefined, parsed);
        });
      } else {
        return this.createSharedSSI(callback);
      }
    });
  }

  createSharedSSI(callback) {
    const ssi = keySSISpace.createSeedSSI('default');
    this.DSUStorage.setObject(KEYSSI_FILE_PATH, { sharedSSI: ssi.derive().getIdentifier() },(err)=>{
      if(err){
        return callback(err);
      }
      callback(undefined, ssi);
    });

  }
}

let instance;
module.exports.getSharedStorage = function (dsuStorage) {
    if (typeof instance === 'undefined') {
      instance = new SharedStorage(dsuStorage);
      const promisifyFns = ["addSharedFile","cancelBatch","commitBatch","filter","getRecord","getSharedSSI","insertRecord","updateRecord"]
      for(let i = 0; i<promisifyFns.length; i++){
        let prop = promisifyFns[i];
        if(typeof instance[prop] ==="function"){
          instance[prop] = $$.promisify(instance[prop].bind(instance));
        }
      }
    }
  return instance;
}
