const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const momentService = cscServices.momentService;

class KitMountingProgressController extends WebcController {

  constructor(...props) {
    super(...props);
   }

  onReady() {
    let progressElement = this.querySelector("#importKitsProgress");
    let startTime = Date.now();
    let averageProgressRate;

    let changeProgressHandler = ()=>{
      let progress = this.model.kitsMounting.progress;
      progressElement.style.width = progress+"%";
      averageProgressRate = (Date.now()-startTime)/progress;
      let leftTime = (100 - progress) * averageProgressRate;
      this.model.kitsMounting.eta = momentService.utc(leftTime).format("HH:mm:ss")

      if (progress === 100) {
        this.model.kitsMounting.importInProgress = false;
        this.model.offChange("kitsMounting.progress",changeProgressHandler)
      }
    }

    this.model.onChange("kitsMounting.progress",changeProgressHandler)
  }

}

export default KitMountingProgressController;