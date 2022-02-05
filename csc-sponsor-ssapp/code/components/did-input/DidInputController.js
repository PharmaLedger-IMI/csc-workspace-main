const { WebcController } = WebCardinal.controllers;


class DidInputController extends WebcController {
  constructor(...props) {
    super(...props);

    const host = props[0];
    const bindingChain = host.webcModelChains['binding-chain'];
    const input = this.querySelector('input');

    this.onTagClick('scan-did', () => {

      const modalContent = `<psk-barcode-scanner data='@${bindingChain}'>
                <webc-spinner slot='init'></webc-spinner>
                <webc-spinner slot='feedback'></webc-spinner>
              </psk-barcode-scanner>
              `;

      let modal = this.createWebcModal({
        modalTitle: 'Scan DID',
        model: this.model,
        modalContent: '',
        disableFooter: true
      });

      modal.innerHTML = modalContent;

      this.model.onChange(bindingChain, () => {
        modal.destroy();
        input.classList.add('highlight');
        setTimeout(() => {
          input.classList.remove('highlight');
        }, 1000);
      });

    });

  }

}

export { DidInputController };