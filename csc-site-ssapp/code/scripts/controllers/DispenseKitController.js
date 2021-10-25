const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const viewModelResolver = cscServices.viewModelResolver;

class DispenseKitController extends WebcController {

  constructor(...props) {
    super(...props);
    this.kitsService = new KitsService(this.DSUStorage);
    this.initViewModel();

    this.onTagClick("dispense-kit",()=>{
      //TODO #487
      console.log("Implement #487")
    })
  }

  async initViewModel() {
    const model = {
      kitModel: viewModelResolver('kit')
    };
      let { studyId, orderId } = this.history.location.state.kit;
      this.model.studyId = studyId;
      this.model.orderId = orderId;

    this.model = model;
  }

}
export default DispenseKitController;