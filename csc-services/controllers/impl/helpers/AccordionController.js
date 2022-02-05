const { WebcController } = WebCardinal.controllers;

class AccordionControllerImpl extends WebcController {
    constructor(...props) {
        super(...props);
    }

    toggleAccordionItemHandler() {
        this.onTagEvent('toggle-accordion', 'click', (model, target) => {
            const targetIcon = target.querySelector('.accordion-icon');
            target.classList.toggle('accordion-item-active');
            targetIcon.classList.toggle('rotate-icon');

            const panel = target.nextElementSibling;
            if (panel.classList.contains("expanded")) {
                panel.classList.remove("expanded");
            } else {
                panel.classList.add("expanded");
            }
        });
    }

    openFirstAccordion() {
        const accordion = this.querySelector('.accordion-item');
        const targetIcon = accordion.querySelector('.accordion-icon');
        const panel = accordion.nextElementSibling;

        accordion.classList.toggle('accordion-item-active');
        targetIcon.classList.toggle('rotate-icon');
        panel.classList.add("expanded");
    }

}
const controllersRegistry = require('../../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('AccordionController', AccordionControllerImpl);
module.exports = AccordionControllerImpl;