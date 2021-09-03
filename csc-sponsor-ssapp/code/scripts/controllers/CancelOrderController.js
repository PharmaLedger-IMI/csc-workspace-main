const { WebcController } = WebCardinal.controllers;

export default class CancelOrderController extends WebcController {
  constructor(...props) {
    super(...props);
    this.model.onChange('cancelOrderModal.comment.value', () => {
      this.model.cancelOrderModal.commentIsEmpty = this.model.cancelOrderModal.comment.value.length === 0;
    });

  }
}