const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const MessageHandlerService = cscServices.MessageHandlerService;
const { Roles } = cscServices.constants;

class DashboardController extends WebcController {
  constructor(...props) {
    super(...props);

    this.model = {
      tabNavigator: {
        selected: '0'
      }
    };

    MessageHandlerService.init(Roles.Courier, this.DSUStorage);
    this.attachHandlers();
  }

  attachHandlers() {

    this.model.addExpression('isShipmentsSelected', () => this.model.tabNavigator.selected === '1', 'tabNavigator.selected');
    this.onTagClick('change-tab', async (model, target) => {
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.remove('active');
      this.model.tabNavigator.selected = target.getAttribute('data-custom');
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.add('active');
    });
  }

}
export default DashboardController;
