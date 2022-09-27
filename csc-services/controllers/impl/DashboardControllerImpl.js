const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const { messagesEnum } = require('../../services/constants');
const { Roles, Topics } = cscServices.constants;
const MessageHandlerService = cscServices.MessageHandlerService;

class DashboardControllerImpl extends WebcController {
  constructor(role, ...props) {
    super(...props);

    this.role = role;
    this.init();
  }

  async init() {
    this.attachHandlers();
    this.initModel();
    this.initServices();
    this.checkUserAuthorization();
  }

  initServices() {
    MessageHandlerService.init(this.role, () => {
        //TODO new message consuming in progress
      }, (data) => {
        // TODO: Message consumed finished
        // Current implementation is for demiurge when the user is added to a group
        this.model.isMemberAddedToGroup = data.messageType === messagesEnum.AddMemberToGroup;
      },
      (err) => {
        //some fatal error occurred
        alert('An error occurred! Please refresh your wallet');
      });
  }

  initModel() {
    let selectedTab;
    if (this.history.location.state && this.history.location.state.tab) {
      selectedTab = this.history.location.state.tab;
    } else {
      switch (this.role) {
        case Roles.Site:
        case Roles.Courier:
          selectedTab = Topics.Shipment;
          break;
        default:
          selectedTab = Topics.Order;
      }
    }

    this.model = {
      isMemberAddedToGroup: false,
      tabNavigator: {
        selected: selectedTab
      }
    };
  }

  checkUserAuthorization() {
    const openDSU = require('opendsu');
    const scAPI = openDSU.loadAPI('sc');
    const sc = scAPI.getSecurityContext();

    const _waitForAuthorization = async () => {
      const mainEnclave = await $$.promisify(scAPI.getMainEnclave)();
      let credential;
      try {
        credential = await $$.promisify(mainEnclave.readKey)('credential');
      } catch (e) {
        console.log('[Demiurge] User is not added to any group. Waiting for authorization...');
      }

      if (!credential || credential === 'deleted') {
        return;
      }

      // Authorization is done
      console.log('[Demiurge] User is authorized!');
      this.model.isMemberAddedToGroup = true;
    };

    if (sc.isInitialised()) {
      return _waitForAuthorization();
    }

    sc.on('initialised', _waitForAuthorization);
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
