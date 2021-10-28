const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const ProfileService = cscServices.ProfileService;
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
      kitModel: viewModelResolver('kit'),
      userName: ''
    };
      let { studyId, orderId } = this.history.location.state.kit;
      this.model.studyId = studyId;
      this.model.orderId = orderId;
 	  this.profileService = new ProfileService(this.DSUStorage);
 	  this.profileService.getUserDetails((err, userDetails) => {
 			if (err) {
 				return console.log('[UserDetails] [ERROR]', err);
 			}
 			this.model.userName = userDetails.username;
 	  });

    this.model = model;
    console.log('Model : ', JSON.stringify(this.model));
  }

}
export default DispenseKitController;