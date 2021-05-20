const { WebcController } = WebCardinal.controllers;

export default class InitiateOrderController extends WebcController {

    constructor(element, history) {

        super(element, history);

        this.model = {
            name: "hi"
        };
    }


}
