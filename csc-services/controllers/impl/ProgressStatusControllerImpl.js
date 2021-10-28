const { WebcController } = WebCardinal.controllers;

class ProgressStatusControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    console.log(this.model);
  }

  onReady(){
    let progressElement = this.querySelector(".progress-bar");
    progressElement.style.width = parseInt((this.model.progress / this.model.total)*100)+"%";
    progressElement.innerText = `${this.model.progress} / ${this.model.total}`;
  }
}
const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ProgressStatusController', ProgressStatusControllerImpl);