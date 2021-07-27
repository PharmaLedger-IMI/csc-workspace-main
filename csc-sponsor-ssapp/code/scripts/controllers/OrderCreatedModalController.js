// MyModalController.js
const { WebcController } = WebCardinal.controllers;

class OrderCreatedModalController extends WebcController {

    constructor(...props) {
        super(...props);


        console.log(this.model);

        debugger;

        this.onTagEvent('navigate-to-order', 'click', (e) => {
            this.navigateToPageTag('order', {
                keySSI:this.model.keySSI
            });
        });
    }

}

export default OrderCreatedModalController;
