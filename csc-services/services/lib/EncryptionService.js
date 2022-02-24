let SITE_PUBLIC_KEY = "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA810hCqXymzD5o1FfgwFyDC63VAgqPL3QrHGUa/iV4KyPw8PcOi8NKL7IFNoc/8xtGDL7wG6RfEs4QNKFjVN5JdE/32Ml+IMIHghbC2zLRmrGZKJNUv2Y4WRElN7YtTBxO/wt2cQq08uuTLFxqzDB+16nY5IcgBi9uHlHBllPb1PGy9b8/bfSfMs+inYP9ICmPAKQuNY5arSV1IsQEGs2eTx/GmRJQ6Exybd+TH/BxqSPkqz3DxtcN9BfYD/Xqavk4THN4oaD9SvRoL1eGhvjdUiQ+rRXY5BZNwrOHNJygrY9o8rt5sz/a0BSnqAMTvXkSupDGqooREggFyA2dj90QwXZMJnCpfgby6xRRU5uae+Y3gzNZddT8lClFf6B3gfWITbX//4O0pMCaJmYuwKt/lvD2s4/MlXx3yAppfsXgThm3SWwA3j6MuDmSi2vFBnmcZefZLIJjrVjPk6kdTAadu0GcfmGEUfixmbcx134mkXrimSTLHajQSsLjTwSvAchhCzwMldc7bjMvxIl7NCrd1t9GAyYItSSShCPtdOyRK5oKhkltQZSXZbBH1s8GhTMh+x0Q1BUfBpubv1r5pRiEHry5/6uW97Mc+po0+xe/b0drU3Kd1wuh3f4g8sK4DE5gn+AlEZPY3bZGcALDXZMBS/4twYwKgS1EgS5eMsLLZ0CAwEAAQ==";
let SITE_PRIV_KEY = "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";

const ALGORITHM = {
  name: "RSA-OAEP",
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256"
}

function getMessageEncoding(message) {
  let encoder = new TextEncoder();
  return encoder.encode(message);
}

function getMessageDecode(arrayBuffer) {
  let decoder = new TextDecoder();
  return decoder.decode(arrayBuffer);
}

module.exports = {

  generateAsymmetricKeys:async function(){
    const RSAKeys = await window.crypto.subtle.generateKey(ALGORITHM, true, ["encrypt", "decrypt"])

    let privateKey = this.arrayBufferToBase64(await crypto.subtle.exportKey("pkcs8",RSAKeys.privateKey))
    let publicKey = this.arrayBufferToBase64(await crypto.subtle.exportKey("spki",RSAKeys.publicKey))

    return {privateKey, publicKey}
  },

  encryptData: async function(data) {

    let encryptedData;

    try {
      let publicKey = await this.getPublicKey();
      let encodedMessage = getMessageEncoding(data);
      encryptedData = await window.crypto.subtle.encrypt(
        ALGORITHM,
        publicKey,
        encodedMessage
      );
    }

    catch (e) {
      console.log(e)
    }

    return this.arrayBufferToBase64(encryptedData);
  },
  decryptData: async function(encryptedData) {
    let cipherArrayBuffer = await this.base64ToArrayBuffer(encryptedData);

    const decodedArrayBuffer = await window.crypto.subtle.decrypt(
      ALGORITHM,
      await this.getPrivateKey(),
      cipherArrayBuffer
    );

    return getMessageDecode(decodedArrayBuffer)
  },
  getPrivateKey:async function(){
    const privKeyArrayBuffer = this.base64ToArrayBuffer(SITE_PRIV_KEY);

    return await crypto.subtle.importKey(
      'pkcs8',
      privKeyArrayBuffer,
      ALGORITHM,
      true,
      ['decrypt']
    );

  },
  getPublicKey:async function(){
    const publicKeyArrayBuffer = this.base64ToArrayBuffer(SITE_PUBLIC_KEY);
    return await crypto.subtle.importKey(
      'spki',
      publicKeyArrayBuffer,
      ALGORITHM,
      true,
      ['encrypt']
    );
  },
  setPrivateKey:function(data){
    SITE_PRIV_KEY = data;
  },
  setPublicKey:function(data){
    SITE_PUBLIC_KEY = data
  },

  arrayBufferToBase64:function(buf){
    return btoa([...new Uint8Array(buf)].map(x => String.fromCharCode(x)).join(""))
  },
  base64ToArrayBuffer:function(base64){
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
}