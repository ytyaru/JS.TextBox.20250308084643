;(function(){
class OverlayBox {
    constructor() {
        this._el = this.#makeEl();
    }
    get el() {return this._el}
    #makeStyle() {
        const style = document.createElement('style');
        style.textContent = `
div[name="overlay-box"] {
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
    #makeEl() {
        const root = document.createElement('div');
        root.setAttribute('name', 'overlay-box');
        root.classList.add('overlay-box');
        root.append(this.#makeStyle(), 'overlay-box')
        return root;
    }
}
window.OverlayBox = OverlayBox;
})();
