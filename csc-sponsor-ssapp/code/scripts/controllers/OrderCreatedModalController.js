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

        this.onTagEvent('navigate-to-dashboard', 'click', (e) => {
            this.navigateToPageTag('dashboard', {});
        });
    }

}

export default OrderCreatedModalController;
