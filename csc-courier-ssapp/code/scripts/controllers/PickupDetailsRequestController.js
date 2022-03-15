const { WebcController } = WebCardinal.controllers;

export default class PickupDetailsRequestController extends WebcController {
  constructor(...props) {
    super(...props);
    const observedChains = ['pickupDateTimeChangeRequest.pickupDateTime.date', 'pickupDateTimeChangeRequest.pickupDateTime.time', 'pickupDateTimeChangeRequest.reason'];
    this.model.onChange('pickupDateTimeChangeRequest', (changedInfo) => {
      if (observedChains.includes(changedInfo.targetChain)) {
        const changeDetails = this.model.pickupDateTimeChangeRequest;
        this.model.pickupDateTimeChangeRequest.incompleteRequest = changeDetails.reason.trim() === '' ||
          !changeDetails.pickupDateTime.date || !changeDetails.pickupDateTime.time;
      }
    });

  }
}