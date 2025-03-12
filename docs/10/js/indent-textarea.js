class IndentTextAreaElement extends HTMLTextAreaElement {
    constructor() {
        super();
        this.placeholder = 'Type some text';
        this.cols = 60;
        this.rows = 10;
        this._options = {
            mode: 'view', // 'view'/'edit'
            tab: {char:'\t', size:4},
            indent: {allowEmptyLines:false},
            file: {
                charset: 'utf8-bom',
                newline: '\n',
                tab: 'same',
                name: 'some-{now}.txt',
                lang: 'plain',
            },
        }
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
        return ['mode','tab','file'];
    }
}
customElements.define('edit-or-view', IndentTextAreaElement, {extends:'textarea'});
// <textarea is="edit-or-view"></textarea>
