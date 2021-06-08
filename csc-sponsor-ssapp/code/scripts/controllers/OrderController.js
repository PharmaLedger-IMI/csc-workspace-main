// eslint-disable-next-line no-undef
const { WebcController } = WebCardinal.controllers;
import OrdersService from '../services/OrdersService.js';

export default class OrderController extends WebcController {
  constructor(...props) {
    super(...props);
    this.model = {};

    let { id, keySSI } = this.history.location.state;
    this.ordersService = new OrdersService(this.DSUStorage);

    this.model.id = id;
    this.model.keySSI = keySSI;

    this.attachEvents();

    this.init();
  }

  async init() {
    this.model.order = await this.ordersService.getOrder(this.model.keySSI);
    console.log('MODEL:', JSON.stringify(this.model.order, null, 2));
    return;
  }

  attachEvents() {
    return;
  }
}
