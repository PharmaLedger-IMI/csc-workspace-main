const { WebcController } = WebCardinal.controllers;

export default class ShipmentsController extends WebcController {
  constructor(...props) {
    super(...props);

    this.model = {
      aris: "aris"
    };

    this.init();
    this.attachAll();
  }

  init() {
  }

  attachAll() {
  }
}
