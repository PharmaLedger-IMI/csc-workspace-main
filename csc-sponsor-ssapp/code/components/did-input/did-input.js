customElements.define(
  'did-input',
  class _ extends HTMLElement {
    constructor() {
      super();

      const attributes = this.getAttributeNames();

      this.input = document.createElement('input');
      this.input.setAttribute('type', 'text');

      attributes.forEach(attribute => {
        this.input.setAttribute(attribute, this.getAttribute(attribute));
      });

      if (this.hasAttribute('data-view-model')) {
        this.bindingChain = this.getAttribute('data-view-model') + '.value';
      }

      if (this.hasAttribute('value')) {
        this.bindingChain = this.getAttribute('value');
      }

      if (!this.bindingChain) {
        throw new Error('No binding value was set');
      }

      this.className = '';
      this.render();
    }

    render() {
      this.innerHTML = `
            <link rel='stylesheet' href='components/did-input/did-input.css'>
            <webc-container controller='DidInputController' binding-chain='${this.bindingChain}' data-view-model='@'>
            <div class='did-input'>
                <div class='input-group'>
                 ${this.input.outerHTML}
                    <div class='input-group-append'>
                        <button class='btn btn-outline-secondary scan-did-btn'  data-tag='scan-did' type='button'>
                            <i class='fa fa-qrcode'></i>
                        </button>
                    </div>
                </div>
            </div>
            </webc-container>
        `;
    }

  }
);