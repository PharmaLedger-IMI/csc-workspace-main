const { WebcController } = WebCardinal.controllers;

export default class PendingActionsController extends WebcController {

    constructor(element, history) {

        super(element, history);

        this.model = {
            name: "hi"
        };
    }


}
