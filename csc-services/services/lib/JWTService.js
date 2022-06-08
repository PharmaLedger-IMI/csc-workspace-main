const openDSU = require('opendsu');
const credentials = openDSU.loadApi('credentials');

class JWTService {

  async createVerifiableCredential(issuer, subject, options) {
    return await credentials.createJWTVerifiableCredentialAsync(issuer, subject, options);
  }

  async verifyCredential(encodedJWTVerifiableCredential, atDate = Date.now(), rootsOfTrust = []) {
    const jwtVcInstance = await credentials.loadJWTVerifiableCredentialAsync(encodedJWTVerifiableCredential);
    const verifyCredentialStatus = await jwtVcInstance.verifyJWTAsync(atDate, rootsOfTrust);

    console.log(jwtVcInstance, verifyCredentialStatus);
    return { jwtVcInstance, verifyCredentialStatus };
  }

  async createVerifiablePresentation(issuer, options) {
    return await credentials.createJWTVerifiablePresentationAsync(issuer, options);
  }

  async verifyPresentation(encodedJWTVerifiablePresentation, atDate = Date.now(), rootsOfTrust = []) {
    const loadedPresentation = await credentials.loadJWTVerifiablePresentationAsync(encodedJWTVerifiablePresentation);
    const verifyPresentationStatus = await loadedPresentation.verifyJWTAsync(atDate, rootsOfTrust);

    console.log(verifyPresentationStatus);
    return verifyPresentationStatus;
  }

  async createKitsIdsPresentationForSite(sponsorDID, siteDID, kitsIdsSReadSSI) {
    const jwtVcInstance = await this.createVerifiableCredential(sponsorDID, siteDID);
    await jwtVcInstance.embedClaimAsync('kitsIdsSReadSSI', kitsIdsSReadSSI);
    const encodedJwtVc = await jwtVcInstance.getEncodedJWTAsync();

    const jwtVpInstance = await this.createVerifiablePresentation(sponsorDID, { aud: siteDID });
    const addZKPCredentialResult = await jwtVpInstance.addZeroKnowledgeProofCredentialAsync(encodedJwtVc);
    const encodedJwtVp = await jwtVpInstance.getEncodedJWTAsync();

    console.log('encoded jwtVc and jwtVp of the kits id dsu: ', encodedJwtVc, addZKPCredentialResult, encodedJwtVp);

    return encodedJwtVp;
  }

  async verifyKitsIdsPresentation(kitIdJWTVerifiablePresentation) {
    const jwtVpVerifyResult = await this.verifyPresentation(kitIdJWTVerifiablePresentation);
    const kitsIdsSReadSSI = jwtVpVerifyResult.vp.verifiableCredential[0].kitsIdsSReadSSI;

    console.log('kits from presentation: ', jwtVpVerifyResult, kitsIdsSReadSSI);

    return { kitsIdsSReadSSI, jwtVpVerifyResult };
  }

  async createShipmentVerifiableCredential(courierDID, siteDID, shipmentClaims) {
    const jwtVcInstance = await this.createVerifiableCredential(courierDID, siteDID);
    for (const claimKey of Object.keys(shipmentClaims)) {
      await jwtVcInstance.embedClaimAsync(claimKey, shipmentClaims[claimKey]);
    }
    const encodedJwtVc = await jwtVcInstance.getEncodedJWTAsync();
    console.log('encoded jwtVc of the shipment: ', encodedJwtVc);
    return encodedJwtVc;
  }

  async updateShipmentVerifiableCredential(shipmentJwtVc, shipmentClaims) {
    const { jwtVcInstance } = await this.verifyCredential(shipmentJwtVc);
    for (const claimKey of Object.keys(shipmentClaims)) {
      await jwtVcInstance.embedClaimAsync(claimKey, shipmentClaims[claimKey]);
    }
    const encodedJwtVc = await jwtVcInstance.getEncodedJWTAsync();
    console.log('encoded jwtVc of the shipment: ', encodedJwtVc);
    return encodedJwtVc;
  }

  async createShipmentPresentation(shipmentJwtVc, courierDID) {
    const jwtVpInstance = await this.createVerifiablePresentation(courierDID);
    const addJWTVcResult = await jwtVpInstance.addVerifiableCredentialAsync(shipmentJwtVc);
    const encodedJwtVp = await jwtVpInstance.getEncodedJWTAsync();
    console.log('encoded jwtVc and jwtVp of the shipment: ', shipmentJwtVc, addJWTVcResult, encodedJwtVp);
    return encodedJwtVp;
  }

  async verifyShipmentPresentation(shipmentJWTVerifiablePresentation) {
    const jwtVpVerifyResult = await this.verifyPresentation(shipmentJWTVerifiablePresentation);
    const {
      shipmentIdentifier,
      shipmentPickupAtWarehouseSigned,
      shipmentDeliveredSigned
    } = jwtVpVerifyResult.vp.verifiableCredential[0];

    console.log('shipment details from presentation: ', jwtVpVerifyResult, shipmentIdentifier, shipmentPickupAtWarehouseSigned, shipmentDeliveredSigned);

    return {
      shipmentIdentifier,
      shipmentPickupAtWarehouseSigned,
      shipmentDeliveredSigned,
      jwtVpVerifyResult
    };
  }

  async createShipmentBillingPresentationForSponsor(courierDID, sponsorDID, billingClaims) {
    const jwtVcInstance = await this.createVerifiableCredential(courierDID, sponsorDID);
    for (const claimKey of Object.keys(billingClaims)) {
      await jwtVcInstance.embedClaimAsync(claimKey, billingClaims[claimKey]);
    }
    const encodedJwtVc = await jwtVcInstance.getEncodedJWTAsync();

    const jwtVpInstance = await this.createVerifiablePresentation(courierDID, { aud: sponsorDID });
    const addJWTVcResult = await jwtVpInstance.addZeroKnowledgeProofCredentialAsync(encodedJwtVc);
    const encodedJwtVp = await jwtVpInstance.getEncodedJWTAsync();

    console.log('encoded jwtVc and jwtVp of the shipment billing dsu data: ', encodedJwtVc, addJWTVcResult, encodedJwtVp);

    return encodedJwtVp;
  }

  async verifyShipmentBillingPresentation(shipmentBillingJWTVP) {
    const jwtVpVerifyResult = await this.verifyPresentation(shipmentBillingJWTVP);
    const { billNumber, hsCode } = jwtVpVerifyResult.vp.verifiableCredential[0];

    console.log('shipment billing details from presentation: ', jwtVpVerifyResult, billNumber, hsCode);

    return {
      billNumber,
      hsCode,
      jwtVpVerifyResult
    };
  }

  async createShipmentReceivedPresentation(siteDID, courierDID, billingClaims) {
    const jwtVcInstance = await this.createVerifiableCredential(siteDID, courierDID);
    for (const claimKey of Object.keys(billingClaims)) {
      await jwtVcInstance.embedClaimAsync(claimKey, billingClaims[claimKey]);
    }
    const encodedJwtVc = await jwtVcInstance.getEncodedJWTAsync();

    const jwtVpInstance = await this.createVerifiablePresentation(siteDID);
    const addJWTVcResult = await jwtVpInstance.addVerifiableCredentialAsync(encodedJwtVc);
    const encodedJwtVp = await jwtVpInstance.getEncodedJWTAsync();

    console.log('encoded jwtVc and jwtVp of the shipment received data: ', encodedJwtVc, addJWTVcResult, encodedJwtVp);

    return encodedJwtVp;
  }

  async verifyShipmentReceivedPresentation(shipmentJWTVerifiablePresentation) {
    const jwtVpVerifyResult = await this.verifyPresentation(shipmentJWTVerifiablePresentation);
    const { shipmentReceivedSigned } = jwtVpVerifyResult.vp.verifiableCredential[0];

    console.log('shipment details from presentation: ', jwtVpVerifyResult, shipmentReceivedSigned);

    return {
      shipmentReceivedSigned,
      jwtVpVerifyResult
    };
  }
}

module.exports = JWTService;