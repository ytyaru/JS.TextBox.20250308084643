;(function(){
class OverlayBox {
    constructor(options) {// base:el, ...
        this._options = {...this.defaultOptions, ...options};
//        if (!this._options.baseEl) {this._options.baseEl=this.#makeDefaultBaseEl()}
        this.#makeDefaultBaseEl();
        this._el = this.#makeEl();
        this.#addEvent();
    }
    get el() {return this._el}
    get baseEl() {return this._el.querySelector(`.base-el`)}
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
`;
        return style;
    }
    #makeDefaultBaseEl() {
        if (this._options.baseEl instanceof HTMLElement) {
            if (!this._options.baseEl.classList.has('base-el')) {
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
        return root;
    }
    #makeArea() {
        const area = document.createElement('div');
        area.setAttribute('name', 'overlay-area');
        area.classList.add('overlay-area');
        area.append(this.#makeStyle(), 'overlay-area')
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
window.OverlayBox = OverlayBox;
})();
