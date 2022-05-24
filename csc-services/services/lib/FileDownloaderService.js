module.exports = class FileDownloaderService  {
  files = [];
  constructor() { }

  async prepareDownloadFromDsu(path, filename) {
    return new Promise(async (resolve, reject) => {
      let file = this.files.find((x) => x.filename === filename);
      if (!file) {
        file = {
          path: path === '/' ? '' : path,
          filename,
        };
        this.files.push(file);

        try{
          await this._getFileBlob(file.path, file.filename);
        }
        catch (e) {
          reject(e);
        }
        resolve();
      } else resolve();
    });
  }

  prepareDownloadFromBrowser(file) {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        let blob = new Blob([new Uint8Array(e.target.result)], { type: file.type });
        this.files.push({
          filename: file.name,
          rawBlob: blob,
          mimeType: blob.type,
        });
        resolve();
      };
      reader.readAsArrayBuffer(file);
    });
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
    let buffer;
    try {
      buffer = await this.readFileAsync(path + '/' + filename);
    } catch (e) {
      throw new Error('File not found');
    }

    const blob = new Blob([buffer]);
    file['rawBlob'] = blob;
    file['mimeType'] = blob.type;
  }
};
