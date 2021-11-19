const { WebcController } = WebCardinal.controllers;

class AccordionControllerImpl extends WebcController {
    constructor(...props) {
        super(...props);
    }

    toggleAccordionItem(el) {
        const element = document.getElementById(el);

        const icon = document.getElementById(el + '_icon');
        element.classList.toggle('accordion-item-active');
        icon.classList.toggle('rotate-icon');

        const panel = element.nextElementSibling;

        if (panel.style.maxHeight === '1000px') {
            panel.style.maxHeight = '0px';
        } else {
            panel.style.maxHeight = '1000px';
        }
    }

    openAccordionItem(el) {
        const element = document.getElementById(el);
        const icon = document.getElementById(el + '_icon');

        element.classList.add('accordion-item-active');
        icon.classList.add('rotate-icon');

        const panel = element.nextElementSibling;
        panel.style.maxHeight = '1000px';

        this.closeAllExcept(el);
    }

    closeAccordionItem(el) {
        const element = document.getElementById(el);
        const icon = document.getElementById(el + '_icon');

        element.classList.remove('accordion-item-active');
        icon.classList.remove('rotate-icon');

        const panel = element.nextElementSibling;
        panel.style.maxHeight = '0px';
    }

    toggleAccordionItemHandler() {
        this.onTagEvent('toggle-accordion', 'click', (model, target) => {
            const targetIcon = target.querySelector('.accordion-icon');
            target.classList.toggle('accordion-item-active');
            targetIcon.classList.toggle('rotate-icon');

            const panel = target.nextElementSibling;
            if (panel.style.maxHeight === '1000px') {
                panel.style.maxHeight = '0px';
            } else {
                panel.style.maxHeight = '1000px';
            }
        });
    }

    openFirstAccordion() {
        const accordion = this.querySelector('.accordion-item');
        const targetIcon = accordion.querySelector('.accordion-icon');
        const panel = accordion.nextElementSibling;

        accordion.classList.toggle('accordion-item-active');
        targetIcon.classList.toggle('rotate-icon');
        panel.style.maxHeight = '1000px';
    }

}
const controllersRegistry = require('../../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('AccordionController', AccordionControllerImpl);
module.exports = AccordionControllerImpl;