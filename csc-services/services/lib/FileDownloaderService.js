const DSUService = require('./DSUService.js');

module.exports = class FileDownloaderService extends DSUService {
  files = [];

  constructor(DSUStorage) {
    super(DSUStorage);
    this.DSUStorage = DSUStorage;
  }

  async prepareDownloadFromDsu(path, filename) {
    let file = this.files.find((x) => x.filename === filename);
    if (!file) {
      file = {
        path: path === '/' ? '' : path,
        filename,
      };
      this.files.push(file);

      await this._getFileBlob(file.path, file.filename);
    }
  }

  async prepareDownloadFromBrowser(file) {
    let reader = new FileReader();
    reader.onload = (e) => {
      let blob = new Blob([new Uint8Array(e.target.result)], { type: file.type });
      this.files.push({
        filename: file.name,
        rawBlob: blob,
        mimeType: blob.type,
      });
    };
    reader.readAsArrayBuffer(file);
  }

  downloadFileToDevice = (filename) => {
    const downloadedFile = this.files.find((x) => x.filename === filename);
    window.URL = window.URL || window.webkitURL;
    let blob = downloadedFile.rawBlob;

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      const file = new File([blob], filename);
      window.navigator.msSaveOrOpenBlob(file);
      return;
    }

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  async _getFileBlob(path, filename) {
    const file = this.files.find((x) => x.filename === filename);
    const buffer = await this.readFileAsync(path + '/' + filename);
    const blob = new Blob([buffer]);
    file['rawBlob'] = blob;
    file['mimeType'] = blob.type;
    return;
  }
};
