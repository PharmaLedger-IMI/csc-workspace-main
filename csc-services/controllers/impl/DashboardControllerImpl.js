const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const { Roles, Topics } = cscServices.constants;
const MessageHandlerService = cscServices.MessageHandlerService;

class DashboardControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);
    this.role = role;
    let selectedTab;
    MessageHandlerService.init(role, () => {
        //TODO new message consuming in progress
      }, () => {
        ////TODO message consumed finished
      },
      (err) => {
        //some fatal error occurred
       alert("An error occurred! Please refresh your wallet")
      });
    if (this.history.location.state && this.history.location.state.tab) {
      selectedTab = this.history.location.state.tab;
    } else {
      switch (role) {
        case Roles.Site:
        case Roles.Courier:
          selectedTab = Topics.Shipment;
          break;
        default:
          selectedTab = Topics.Order;
      }
    }

    this.model = {
      tabNavigator: {
        selected: selectedTab
      }
    };

    this.attachHandlers();
  }

  attachHandlers() {
    this.modelExpressionsHandler();
    this.changeTabHandler();
  }

  modelExpressionsHandler() {
    this.model.addExpression('isOrdersSelected', () => this.model.tabNavigator.selected === Topics.Order, 'tabNavigator.selected');
    this.model.addExpression('isShipmentsSelected', () => this.model.tabNavigator.selected === Topics.Shipment, 'tabNavigator.selected');
    this.model.addExpression('isKitsSelected', () => this.model.tabNavigator.selected === Topics.Kits, 'tabNavigator.selected');
  }

  changeTabHandler() {
    this.onTagClick('change-tab', async (model, target) => {
      this.model.tabNavigator.selected = target.getAttribute('data-custom');
    });
  }

}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('DashboardController', DashboardControllerImpl);
