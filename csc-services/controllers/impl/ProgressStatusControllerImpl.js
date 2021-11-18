const { WebcController } = WebCardinal.controllers;

class ProgressStatusControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    console.log(JSON.stringify(this.model));
  }

  onReady(){
    let progressElement = this.querySelector(".progress-bar");
    let progressWrapper= this.querySelector(".progress");
    progressElement.style.width = parseInt((this.model.progress / this.model.total)*100)+"%";
    progressElement.innerText = `${this.model.progress} / ${this.model.total}`;

    if(this.model.approved === true) {
        progressElement.classList.add("green");
        progressWrapper.classList.add("green");
    }
    else {
        progressWrapper.classList.add("blue");
    }
  }
}
const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('ProgressStatusController', ProgressStatusControllerImpl);