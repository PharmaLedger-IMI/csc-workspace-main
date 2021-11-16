const { WebcController } = WebCardinal.controllers;

class ProgressStatusControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    console.log(JSON.stringify(this.model));
  }

  onReady(){
    let progressElement = this.querySelector(".progress-bar");
    progressElement.style.width = parseInt((this.model.progress / this.model.total)*100)+"%";
    progressElement.innerText = `${this.model.progress} / ${this.model.total}`;

    if(this.model.approved === true) {
        let progress= this.querySelector(".progress");
        progress.style.background = "green";
//        progress.style.border-color = "green";
        progressElement.style.background = "green";
    }
  }
}
const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ProgressStatusController', ProgressStatusControllerImpl);