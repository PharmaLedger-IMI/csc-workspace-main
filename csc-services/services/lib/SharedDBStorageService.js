const indexedTimestampField = '__timestamp';

class SharedStorage {

  constructor(dsuStorage) {
    this.waitForSharedEnclave((err, sharedEnclave) => {
      if (err) {
        return console.error(err);
      }

      this.enclave = sharedEnclave;
      this.DSUStorage = dsuStorage;
    });
  }

  waitForSharedEnclave(callback) {
    const scApi = require('opendsu').loadApi('sc');
    scApi.getSharedEnclave((err, sharedEnclave) => {
      if (err) {
        console.log('Shared enclave not available! The user does not have access to the application. Waiting for authorization...');
        return setTimeout(() => {
          this.waitForSharedEnclave(callback);
        }, 1000);
      }

      callback(undefined, sharedEnclave);
    });
  }

  waitForDb(func, args) {
    if(typeof args === 'undefined'){
      args = [];
    }
    func = func.bind(this)
    setTimeout(function () {
      func(...args);
    }, 10);
  }

  enclaveReady() {
    return (this.enclave !== undefined && this.enclave !== 'initialising');
  }

  filter(tableName, query, sort, limit, callback) {
    if (this.enclaveReady()) {
      this.enclave.filter(tableName, query, sort, limit, callback);
    } else {
      this.waitForDb(this.filter, [tableName, query, sort, limit, callback]);
    }
  }


  getRecord(tableName, key, callback) {
    if (this.enclaveReady()) {
      this.enclave.getRecord(tableName, key, callback);
    } else {
      this.waitForDb(this.getRecord, [tableName, key, callback]);
    }
  }

  insertRecord(tableName, key, record, callback) {
    if (this.enclaveReady()) {
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
    if (this.enclaveReady()) {
      this.enclave.updateRecord(tableName, key, record, callback);
    } else {
      this.waitForDb(this.updateRecord, [tableName, key, record, callback]);
    }
  }

  beginBatch(){
    if (this.enclaveReady()) {
      this.enclave.beginBatch();
    } else {
      this.waitForDb(this.beginBatch);
    }
  }

  cancelBatch(callback){
    if (this.enclaveReady()) {
      this.enclave.cancelBatch(callback);
    } else {
      this.waitForDb(this.cancelBatch, [callback]);
    }
  }

  commitBatch(callback){
    if (this.enclaveReady()) {
      this.enclave.commitBatch(callback);
    } else {
      this.waitForDb(this.commitBatch, [callback]);
    }
  }

}

let instance;
module.exports.getSharedStorage = function(dsuStorage) {
  if (typeof instance === 'undefined') {
    instance = new SharedStorage(dsuStorage);
    const promisifyFns = ['cancelBatch', 'commitBatch', 'filter', 'getRecord', 'insertRecord', 'updateRecord'];
    for (let i = 0; i < promisifyFns.length; i++) {
      let prop = promisifyFns[i];
      if (typeof instance[prop] === 'function') {
        instance[prop] = $$.promisify(instance[prop].bind(instance));
      }
    }
  }

  return instance;
};
