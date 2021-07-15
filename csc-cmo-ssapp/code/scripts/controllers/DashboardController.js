const { WebcController } = WebCardinal.controllers;
import OrdersService from '../services/OrdersService.js';
import CommunicationService from '../services/CommunicationService.js';
import { messagesEnum } from '../constants/messages.js';

export default class DashboardController extends WebcController {
  constructor(...props) {
    super(...props);

    this.ordersService = new OrdersService(this.DSUStorage);
    this.communicationService = CommunicationService.getInstance(CommunicationService.identities.CSC.CMO_IDENTITY);

    this.model = {
      tabNavigator: {
        selected: '0',
      },
    };

    this.init();

    this.attachAll();

    this.handleMessages();
  }

  init() {}

  handleMessages() {
    this.communicationService.listenForMessages((err, data) => {
      if (err) {
        return console.error(err);
      }
      data = JSON.parse(data);
      switch (data.message.operation) {
        case messagesEnum.StatusInitiated: {
          console.log('message received');
          console.log(data);
          if (data.message.data.orderSSI && data.message.data.documentsSSI) {
            this.ordersService.mountOrder(data.message.data.orderSSI);
            console.log('order added');
          }
          break;
        }
      }
    });
  }

  attachAll() {
    this.model.addExpression(
      'isOrdersSelected',
      () => this.model.tabNavigator.selected === '0',
      'tabNavigator.selected'
    );
    this.model.addExpression(
      'isShipmentsSelected',
      () => this.model.tabNavigator.selected === '1',
      'tabNavigator.selected'
    );
    this.model.addExpression('isKitsSelected', () => this.model.tabNavigator.selected === '2', 'tabNavigator.selected');

    this.onTagClick('change-tab', async (model, target, event) => {
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.remove('active');
      this.model.tabNavigator.selected = target.getAttribute('data-custom');
      document.getElementById(`tab-${this.model.tabNavigator.selected}`).classList.add('active');
    });
  }
}
