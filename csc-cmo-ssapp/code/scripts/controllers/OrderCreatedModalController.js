// MyModalController.js
const { WebcController } = WebCardinal.controllers;

class OrderCreatedModalController extends WebcController {

    constructor(element, history) {
        super(element, history);
        this.model = {
            complex: 'more complex',
            example: 'Form example',
            input: {
                fullName: {
                    type: 'text',
                    placeholder: 'Full name'
                },
                email: {
                    type: 'email',
                    placeholder: 'Email'
                },
                password: {
                    type: 'password',
                    placeholder: 'Password'
                }
            }
        }
    }
}

export default OrderCreatedModalController;
