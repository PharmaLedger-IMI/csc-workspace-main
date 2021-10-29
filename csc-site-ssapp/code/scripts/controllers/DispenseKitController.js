const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const ProfileService = cscServices.ProfileService;
const KitsService = cscServices.KitsService;
const viewModelResolver = cscServices.viewModelResolver;
const { kitsStatusesEnum } = cscServices.constants.kit;

class DispenseKitController extends WebcController {

  constructor(...props) {
    super(...props);
    this.kitsService = new KitsService(this.DSUStorage);
    this.initViewModel();
    this.attachEvents();
  }

  async initViewModel() {

   let { studyId, orderId, keySSI } = this.history.location.state.kit;

    const model = {
      kitModel: viewModelResolver('kit'),
      userName: '',
      studyId: studyId,
      orderId: orderId,
      kitSSI:  keySSI
    };
   

    this.profileService = new ProfileService(this.DSUStorage);
    this.profileService.getUserDetails((err, userDetails) => {
      if (err) {
        return console.log('[UserDetails] [ERROR]', err);
      }
      model.userName = userDetails.username;
      this.model = model;
    });

  }

   attachEvents(){
     this.dispenseKitHandler();
  }

   dispenseKitHandler(){
    this.onTagClick("dispense-kit",  async () => {
      const kitData = this.getkitData();
       await this.kitsService.updateKit(this.model.kitSSI, kitsStatusesEnum.Dispensed, kitData);
        this.navigateToPageTag('kit', {
          keySSI: this.model.kitSSI
        });
    });
  }

  getkitData() {
    return {
      patientId: this.model.kitModel.form.patientId.value,
      doseType: this.model.kitModel.form.doseType.value,
      doseVolume: this.model.kitModel.form.doseVolume.value,
      visitId: this.model.kitModel.form.visitId.value,
      dispensingPartyId: this.model.kitModel.form.dispensingPartyId.value,
      receivedDate: this.model.kitModel.form.receivedDate.value,
      receivedTime: this.model.kitModel.form.receivedTime.value,
    }
  }
}

export default DispenseKitController;