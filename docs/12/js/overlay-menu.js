;(function(){
class OverlayMenu {
    constructor(options) {
        this._el = this.#makeEl();
    }
    get el() {return this._el}
    get defaultOptions() { return {
        mode: 'view', // view/edit
        shows: 'copy download filename fullscreen mode help'.split(' '),
        filename: 'some-{now}.txt',
    } }
    // 各ボタンUI取得（addEventListenerをセットできるように）
    get copy() {return this.#getEl('copy')}
    get download() {return this.#getEl('download')}
    get fullscreen() {return this.#getEl('fullscreen')}
    get mode() {return this.#getEl('mode')}
    get help() {return this._el.querySelector(`button[name="${name}"]`)}
    get fileName() {return this.#getEl('copy')}
    #getEl(name) {return this._el.querySelector(`[name="${name}"]`)}
//    get fileName() {return this.fileNameEl.value}
//    set fileName(v) {this.fileNameEl.value = v}
    #makeStyle() {
        const style = document.createElemnt('style');
        style.cssText = `
div[name="overlay-menu"] {
    position: relative; /*fixed,relative*/
    display: block;
    box-sizing: border-box;
    margin:0; padding:0;
    line-height:1em;
    background: red;
    width:50%; height:50vh;
}
div[name="overlay-menu"] div[name="help"] {
    display: none;
    position: absolute;
    top:0; left:0;
    background: green;
}
div[name="overlay-menu"] div[name="buttons"] {
    position: absolute;
    top:0; right:0;
    padding:0; margin:0;
    line-height:1em;
    box-sizing: border-box;
    background-color: yellow;
}
div[name="overlay-menu"] div[name="file-state"] {
    position: absolute;
    bottom:0; left:0; right:0; 
    margin:0 auto;
    box-sizing: border-box;
    max-width: 50%;
    width: fit-content;
}
`;
        return style;
    }
    #makeEl() {
        const menu = document.createElemnt('div');
        menu.setAttribute('name', 'overlay-menu');
        menu.classList.add('overlay-menu');
        const help = document.createElemnt('div');
        help.setAttribute('name', 'help');
        help.classList.add('help');
        help.innerHTML = this.#makeHelp();
        const buttons = document.createElemnt('buttons');
        buttons.setAttribute('name', 'buttons');
        buttons.classList.add('buttons');
        buttons.append(...this.#makeButtons();)
        const fileState = document.createElemnt('file-state');
        fileState.setAttribute('name', 'file-state');
        fileState.classList.add('file-state');
        fileState.append(this.#makeFilename());
        menu.append(this.#makeStyle(), help, buttons, fileState);
        return menu;
    }
    #makeButtons() {
        const copy = document.createElement('button');
        const download = document.createElement('button');
        const mode = document.createElement('button');
        const fullscreen = document.createElement('button');
        const help = document.createElement('button');
        copy.textContent = '📋';
        download.textContent = '📄';
        mode.textContent = '👀';//✒
        fullscreen.textContent = '全';//全―
        help.textContent = '？';
        return [copy, download, mode, fullscreen, help];
    }
    #makeFilename() {
        const input = document.createElement('field-sizing-input');
        input.setAttribute('name', 'filename');
        input.fontSize = '12px';
        const V = 'some-{now}.txt';
        input.placeholder = V;
        input.value = V;
        input.fontSize = '12px';
        return input;
    }
    #makeHelp() {
        return `
<h1>Help<h1>
<p>　本アプリ<a href="" target="_blank" rel="noopener noreferrer"><code>&lt;text-editor&gt;<code></a>は<a href="https://developer.mozilla.org/ja/docs/Web/HTML/Element/textarea" target="_blank" rel="noopener noreferrer"><code>&lt;textarea&gt;<code></a>をベースにしたUIです。モード切替によって<kbd>Tab<kbd>キーの挙動をインデント／フォーカス遷移に切り替えることができます。</p>

`
        return help;
    }
}
window.OverlayMenu = OverlayMenu;
})();
