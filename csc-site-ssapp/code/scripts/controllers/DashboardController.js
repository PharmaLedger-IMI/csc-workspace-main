const { WebcController } = WebCardinal.controllers;
import OrdersService from '../services/OrdersService.js';

export default class DashboardController extends WebcController {
  constructor(...props) {
    super(...props);

    this.ordersService = new OrdersService(this.DSUStorage);

    this.model = {
      tabNavigator: {
        selected: '0',
      },
    };

    this.init();

    this.attachAll();
  }

  init() {}

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
