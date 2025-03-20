class FieldSizingInput extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({mode:'open'});
        this.#makeStyle();
        this.#makeEl();
        // フォーカスを失ったらキャレットを先頭に戻す
        this.#inputEl.addEventListener('blur', e=>{
            e.target.selectionStart = 0;
            e.target.selectionEnd = 0;
        })
    }
    #makeStyle(shadow) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
:host {
    position: relative;
    display: inline-block;
    background: red;
    padding: 0px 4px;
    box-sizing: border-box;
}
input {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
}
.dummy {
    font-size: 16px;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    opacity: 0;
}
.dummy::before {content: '';}
.dummy:empty::before {content: attr(data-placeholder);}
.font {
    font-family: monoscape;
    font-size: 16px;
    box-sizing: border-box;
    padding:0; margin:0;
    line-height: 1.5em;
    letter-spacing: 0.05em;
    min-width: 1em;
}
`);
        this._shadow.adoptedStyleSheets = [sheet];
    }
    #makeEl(shadow) {
        const dummy = document.createElement('div');
        const input = document.createElement('input');
        dummy.classList.add('dummy', 'font');
        input.classList.add('input', 'font');
        dummy.dataset.placeholder = 'プレースホルダー';
        input.placeholder = 'プレースホルダー';
        input.addEventListener('input', (e)=>{
            this._shadow.querySelector('.dummy').textContent = e.target.value;
        });
        this._shadow.append(dummy, input);
    }
//    connectedCallback() {console.log("カスタム要素がページに追加されました。");}
//    disconnectedCallback() {console.log("カスタム要素がページから除去されました。");}
//    adoptedCallback() {console.log("カスタム要素が新しいページへ移動されました。");}
    attributeChangedCallback(name, oldValue, newValue) {
//        console.log(`属性 ${name} が変更されました。`);
             if ('value'===name) {this.value=newValue}
        else if ('placeholder'===name) {this.placeholder=newValue}
        else if ('font-size'===name) {this.fontSize=newValue}
        else if ('font-family'===name) {this.fontFamily=newValue}
        else if ('max-width'===name) {this.maxWidth=newValue}
    }
    static get observedAttributes() {return ['value', 'placeholder', 'font-family', 'font-size', 'max-width'];}
    get #inputEl() {return this._shadow.querySelector('input')}
    get #dummyEl() {return this._shadow.querySelector('.dummy')}
    get value() {return this.#inputEl.value}
    set value(v) {
        this.#inputEl.value = v;
        this.#dummyEl.textContent = v.replace(/\r\n|\r|\n/gm, '');
    }
    get placeholder(){return this.#inputEl.placeholder}
    set placeholder(v) {
        this.#inputEl.placeholder = v;
        this.#dummyEl.dataset.placeholder = v;
    }
    get fontFamily(){return getComputedStyle(this.#inputEl).fontFamily}
    set fontFamily(v) {
        this.#inputEl.style.fontFamily = v;
        this.#dummyEl.style.fontFamily = v;
        console.log(this.fontFamily);
    }
    get fontSize(){return getComputedStyle(this.#inputEl).fontSize}
    set fontSize(v) {
        this.#inputEl.style.fontSize= v;
        this.#dummyEl.style.fontSize= v;
        console.log(this.fontSize);
    }
    get maxWidth(){return getComputedStyle(this.#inputEl).maxWidth}
    set maxWidth(v) {
        this.style.maxWidth = v;
//        this.#inputEl.style.maxWidth = v;
//        this.#dummyEl.style.maxWidth = v;
        console.log(this.maxWidth);
    }
}
customElements.define('field-sizing-input', FieldSizingInput);
