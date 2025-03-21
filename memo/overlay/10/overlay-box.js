;(function(){
class OverlayBoxElement extends HTMLElement {
    constructor(options) {// baseEl:el, ...
        super();
        this._options = {...this.defaultOptions, ...options};
//        this.#makeDefaultBaseEl();
        this._shadow = this.attachShadow({mode:'open'});
    }
    connectedCallback() {
        console.log("カスタム要素がページに追加されました。");
        // this.textContent を取得するにはsetTimeoutせねばならない! クソ仕様
        // https://stackoverflow.com/questions/64169068/obtain-this-textcontent-during-custom-element-construction
        console.log(this.textContent)
        setTimeout(()=>{
            console.log('setTimeout:', this.textContent);
            console.log('setTimeout:', this.innerHTML);
            this.#makeDefaultBaseEl();
            this.#makeEl();
            this.#addEvent();
            console.log('setTimeout:', this.children);
        }, 0);
    }
    disconnectedCallback() {console.log("カスタム要素がページから除去されました。");}
    adoptedCallback() {console.log("カスタム要素が新しいページへ移動されました。");}
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`属性 ${name} が変更されました。`);
    }
    static get observedAttributes() {return [''];}

    get el() {return this._shadow.querySelector(`div[name="overlay-box"]`)}
    get baseEl() {return this._shadow.querySelector(`.base-el`)}
    get defaultOptions() { return {
        baseEl: null,
    } }
    #makeStyle() {
        const style = document.createElement('style');
        style.textContent = `
div[name="overlay-box"] {
    position: sticky; /*relative, absolute, fixed, sticky*/
    margin:0; padding:0;
    box-sizing: border-box;
    width:300px; height:50vh;
}
div[name="overlay-box"] .base-el {
    position: absolute; top:0; left:0;
    box-sizing: border-box;
    width:100%; height:100%;
}
div[name="overlay-area"] {
    display: block;
    position: absolute; top:0; left:0;
    background-color: red;
    opacity: 0.5;
    width:100%; height:100%;
    pointer-events: none; /*マウスイベント透過*/
}
div[name="overlay-area"] .child {
    position: absolute;
    box-sizing: border-box;
}
div[name="top-left"] {top:0; left:0; background-color:red;}
div[name="top"] {left:0; right:0; margin:0 auto; background-color:green;}
div[name="top-right"] {top:0; right:0; background-color:blue;}
div[name="left"] {top:0; bottom:0; left:0; margin:auto 0;}
div[name="center"] {inset:0; margin:auto;}
div[name="right"] {top:0; bottom:0; right:0; margin:auto 0;}
div[name="bottom-left"] {bottom:0; left:0;}
div[name="bottom"] {bottom:0; left:0; right:0; margin:0 auto;}
div[name="bottom-right"] {bottom:0; right:0;}
`;
        return style;
    }
    #makeDefaultBaseEl() {
        const innerEl = [...this.children].find(el=>'base'===el.getAttribute('name'));
        if (innerEl) {this._options.baseEl = innerEl}
        if (this._options.baseEl instanceof HTMLElement) {
            if (!this._options.baseEl.classList.contains('base-el')) {
                this._options.baseEl.classList.add('base-el');
            }
        } else {
            const el = document.createElement('textarea');
            el.classList.add('base-el');
            this._options.baseEl = el;
        }
    }
    #makeEl() {
        const root = document.createElement('div');
        root.setAttribute('name', 'overlay-box');
        root.classList.add('overlay-box');
        root.append(
            this.#makeStyle(),
            this._options.baseEl,
            this.#makeArea(),
        );
        this._shadow.append(root);
    }
    #makeArea() {
        const area = document.createElement('div');
        area.setAttribute('name', 'overlay-area');
        area.classList.add('overlay-area');
        //area.append(this.#makeStyle(), 'overlay-area')
        const NAMES = {
            type1: 'top-left top top-right left center right bottom-left bottom bottom-right'.split(' '),
            type2: 'north-west north north-east west center east south-west south south-east'.split(' '),
        }
        // 対象要素のみ取得する。余計な要素は消す。
        for (let node of this.childNodes) {
            if (Node.ELEMENT_NODE===node.nodeType) {
                if ([1,2].map(v=>NAMES[`type${v}`].includes(node.getAttribute('name'))).some(v=>v)) {
                    node.classList.add('child');
                    area.append(node)
                }
                else {node.remove()}
            }
        }
        return area;
    }
    #addEvent() {
        (new ResizeObserverX((entries,observer)=>{
            const E = entries[0].target.style;
            const B = entries[0].border[0];
            const T = this.el.style;
            E.contentVisibility = 'hidden';
            T.width = B.width;
            T.height = B.height;
            E.contentVisibility = 'visible';
        })).observe(this.baseEl);
    }
}
customElements.define('overlay-box', OverlayBoxElement);
})();
