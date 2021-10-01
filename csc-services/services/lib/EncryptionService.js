let SITE_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvgQBN2B3VZ6yVs6zPqZXiwgeK72Ir5RCGrqGzaDB65QH7sKEMUOQFzAtF/8UwMEpbZKNae8ySDshSdGt9CYinFhn8s4F4jUkHjBEuUVgmoIC8h2Cdn/AhVXcfxABZW+xd8Bd73FPX5C7DZw7WAW43IbuAzAiLedl3GRdOuYphzpmqN4GRptq8cmD+ZfmbnECStzLiCLotrrh0Lg9jCVAWdyBRRbzrTCrHewWZfRv6h37KOXdcLRmAveNDkuxBYsTYtjbibe+LOSsGjHlq6Zc2zEx2w3copy39Ls3KbKaa9zo2N8FkHz2218GYJ1Fp+kQiGQgqbkSEgHCENmsa5JG6wIDAQAB";
let SITE_PRIV_KEY = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+BAE3YHdVnrJWzrM+pleLCB4rvYivlEIauobNoMHrlAfuwoQxQ5AXMC0X/xTAwSltko1p7zJIOyFJ0a30JiKcWGfyzgXiNSQeMES5RWCaggLyHYJ2f8CFVdx/EAFlb7F3wF3vcU9fkLsNnDtYBbjchu4DMCIt52XcZF065imHOmao3gZGm2rxyYP5l+ZucQJK3MuIIui2uuHQuD2MJUBZ3IFFFvOtMKsd7BZl9G/qHfso5d1wtGYC940OS7EFixNi2NuJt74s5KwaMeWrplzbMTHbDdyinLf0uzcpsppr3OjY3wWQfPbbXwZgnUWn6RCIZCCpuRISAcIQ2axrkkbrAgMBAAECggEABSvho92km/s0np1JiKkmTG2nZ3cq5eUlnT4RQj325juK91zqcTQRh36Tb/h7FNbP5GBDP48x6PSeqMQGr5phXsOTXzaCwzWp82+nxnAo79FjeDn5A15tRGJFHOjmmwJRA0A+fMebO/WCm+7DfrRUzMAMcM7cvF4AOMneHj4RvLnZW4NWe9fLHDMP9eZAhAQCB7Dc5o/pqjmbkV+87APdu4NzCUY/4bViGWg3I1Y2PLfVX0nlh15VsDs/6440GuJMD4nr7Pv4DwD6DoGQuc1lyeHaUsIxyJQysNDvC/yq6x3HJIq68THcJfHKPQ5vsfSpZmdzMm6tUoL90K8ytK8EwQKBgQD4FZBhSN1e7WGqb0iEjMgNOO9cxVI114Cp00/3e01bm0c7+yyJc9rWWYE/WfPwQHHwJzU1XukDrcNVKJbw2xtqBkojD2u6um5C/p5WwHXdl5tpzdHrLqfzSBiM/9fiN1P3JNa5qpbqq1h1I/E9bFuRfXlwHI4z+Mr4xYeEuc1iCQKBgQDEFB3qa1TFJFkpNAhroQYWM+gTj3JAXq3uY6VfrNXeQeJbayJAKdyQufW/hUIWINdtaNJBR3eRuEkgHOGHEY+zvsI0zHYw8vdhZ8c73kEZwA+5TE/Ndc/DzFFD8coSKZRCNxPnpg64jW50Yk9IvMe676e07SPOAmnVwyoAuWcOUwKBgQCvHOmRAhHgU8dAutSBW65KRwoOfeoNv1Q+i75CfnKYWv7pQ96oF3M9ImitAx3BVHwYfFR+m8P2qMzca44/7SloqY/jN5tfbwEtoPS7X5bTF5TIFlQ6ofBDNXy+6kjEkTFfnk1DOTrV4qTJ6tj59macR+lUTZPC87ax6xxBf7WNoQKBgFP+cho7RCL3QSJ/YaQJZHwaXC4U4tJkPInEMdFcTnlZK8gRiqiFxjBRGM6kHP0xsFbz8i14meXYVarl9E5R3YcYDkVj2LV7PzGArT4eJTEMry+nWwAemZO8cIt0hiVlnlcHFQXEgsXYABrnCiOUitKvWt4MP6w+KGwjoFiTE2x1AoGBAItXdXscjd8Of/IyMy9y7S241+GH0DIBmRo+v0Gm2v9HrkhhBMf4jq3whglxSG1DGMiMqXrgaPA0bbdtt2CZ9Yl43oNaUj0LBZgAtsdZFysrWK/IuO00xa8jjmagMjhiNfJPSMvhu6WKcLcbQ7LhGWYa56BHMIfVDMV85361wYbS";

const ALGORITHM = {
  name: "RSA-OAEP",
  modulusLength: 2048,
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
    const encryptedData = await window.crypto.subtle.encrypt(
      ALGORITHM,
      await this.getPublicKey(),
      getMessageEncoding(data)
    );

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