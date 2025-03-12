/*
class ExpandingTextarea extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode:'open'});
        var textarea = document.createElement('textarea');
        textarea.textContent = this.textContent;
        this.shadowRoot.appendChild(textarea);
    }
}
customElements.define("expanding-textarea", ExpandingTextarea);
*/
class IndentTextAreaElement extends HTMLTextAreaElement {
    constructor() {
        super();
//        this.attachShadow({mode:'open'}); // DOMException: Failed to execute 'attachShadow' on 'Element': This element does not support attachShadow
        this.placeholder = 'Type some text';
        this.cols = 60;
        this.rows = 10;
//        console.log(this.value)
//        console.log(this.textContent)
//        this.textContent = this.textContent;
    }
    connectedCallback() {
        console.log("カスタム要素がページに追加されました。");
    }
    disconnectedCallback() {
        console.log("カスタム要素がページから除去されました。");
    }
    adoptedCallback() {
        console.log("カスタム要素が新しいページへ移動されました。");
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`属性 ${name} が変更されました。`);
    }
    static get observedAttributes() {
        return ['tab','filename','lang','value'];
    }
}
customElements.define('edit-or-view', IndentTextAreaElement, {extends:'textarea'});
//customElements.define('indent-or-focus', IndentTextAreaElement, {extends:'textarea'});
// <textarea is="indent-or-focus"></textarea>
