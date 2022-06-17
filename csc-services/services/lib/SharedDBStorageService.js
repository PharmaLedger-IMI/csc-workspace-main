const indexedTimestampField = "__timestamp";

class SharedStorage {

  constructor(dsuStorage) {

    const scApi = require("opendsu").loadApi("sc");
    scApi.getMainEnclave((err, enclaveDB) => {
      if (err) {
        return console.log(err);
      }
      this.enclave = enclaveDB;
      this.DSUStorage = dsuStorage;
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
    return (this.enclave !== undefined && this.enclave !== "initialising");
  }

  filter(tableName, query, sort, limit, callback) {
    if (this.dbReady()) {
      this.enclave.filter(tableName, query, sort, limit, callback);
    } else {
      this.waitForDb(this.filter, [tableName, query, sort, limit, callback]);
    }
  }


  getRecord(tableName, key, callback) {
    if (this.dbReady()) {
      this.enclave.getRecord(tableName, key, callback);
    } else {
      this.waitForDb(this.getRecord, [tableName, key, callback]);
    }
  }

  insertRecord(tableName, key, record, callback) {
    if (this.dbReady()) {
      this.enclave.insertRecord(tableName, key, record, (err, record) => {
        if (err) {
          return callback(err);
        }
        this.enclave.getIndexedFields(tableName, (err, indexedFields) => {
          if (err) {
            return callback(err);
          }
          if (!indexedFields.includes(indexedTimestampField)) {
            return this.enclave.addIndex(tableName, indexedTimestampField, ()=>{
              callback(undefined, record);
            });
          }
          callback(undefined, record);
        });
      });

    } else {
      this.waitForDb(this.insertRecord, [tableName, key, record, callback]);
    }
  }

  updateRecord(tableName, key, record, callback) {
    if (this.dbReady()) {
      this.enclave.updateRecord(tableName, key, record, callback);
    } else {
      this.waitForDb(this.updateRecord, [tableName, key, record, callback]);
    }
  }

  beginBatch(){
    if (this.dbReady()) {
      this.enclave.beginBatch();
    } else {
      this.waitForDb(this.beginBatch);
    }
  }

  cancelBatch(callback){
    if (this.dbReady()) {
      this.enclave.cancelBatch(callback);
    } else {
      this.waitForDb(this.cancelBatch, [callback]);
    }
  }

  commitBatch(callback){
    if (this.dbReady()) {
      this.enclave.commitBatch(callback);
    } else {
      this.waitForDb(this.commitBatch, [callback]);
    }
  }

}

let instance;
module.exports.getSharedStorage = function (dsuStorage) {
    if (typeof instance === 'undefined') {
      instance = new SharedStorage(dsuStorage);
      const promisifyFns = ["cancelBatch","commitBatch","filter","getRecord","insertRecord","updateRecord"]
      for(let i = 0; i<promisifyFns.length; i++){
        let prop = promisifyFns[i];
        if(typeof instance[prop] ==="function"){
          instance[prop] = $$.promisify(instance[prop].bind(instance));
        }
      }
    }
  return instance;
}
