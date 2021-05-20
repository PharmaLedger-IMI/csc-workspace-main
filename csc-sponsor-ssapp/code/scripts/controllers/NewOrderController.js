const { WebcController } = WebCardinal.controllers;

export default class NewOrderController extends WebcController {

    constructor(element, history) {

        super(element, history);

        this.model = {
            name: "hi"
        };
    }


}
