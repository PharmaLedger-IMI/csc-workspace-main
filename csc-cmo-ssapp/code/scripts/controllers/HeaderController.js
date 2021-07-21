const {WebcController} = WebCardinal.controllers;

export default class HeaderController extends WebcController {
    constructor(...props) {
        super(...props);

        console.log(this.model);
    }
}
