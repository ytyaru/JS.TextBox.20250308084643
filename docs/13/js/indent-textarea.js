class IndentTextAreaElement extends HTMLTextAreaElement {
    static get Modes() {return 'view edit'.split(' ')}
    constructor() {
        super();
        this._options = this.defaultOptions;
        this._switchEditModeFromDnD = false; // DnDされたか
        this.addEventListener('keydown', async(e)=>await this.onKeydown(e));
        this.#setupDnD((value, ev) =>{console.log(el, value);this.value = value; this.focus();});
        //this.addEventListener('focus', async(e)=>{if(this.switchEditModeWhenFocused){this.mode='edit'}});
        this.addEventListener('focus', async(e)=>this.onFocus(e));
        this.addEventListener('blur', async(e)=>{if(this.switchViewModeWhenBlur){this.mode='view'}});
    }
    connectedCallback() {console.log("カスタム要素がページに追加されました。");}
    disconnectedCallback() {console.log("カスタム要素がページから除去されました。");}
    adoptedCallback() {console.log("カスタム要素が新しいページへ移動されました。");}
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`属性 ${name} が変更されました。`);
             if ('mode'===name) {this.mode=newValue;}
        else if ('tab'===name) {this.tabStr=newValue;}
        else if ('switch-edit-mode-when-focused'===name){this.switchEditModeWhenFocused=true}
        else if ('switch-view-mode-when-blur'===name){this.switchViewModeWhenBlur=true}
        else if ('filename'===name) {this.filename=newValue;}
        else if ('newline'===name) {this.newline=newValue;}
        else if ('switch-edit-mode-when-dnd'===name){this.switchEditModeWhenDnD=true}
        else if ('show-confirm-when-dnd'===name) {this.showConfirmWhenDnD=true}
    }
    get switchEditModeWhenFocused() {return this.hasAttribute('switch-edit-mode-when-focused');}
    set switchEditModeWhenFocused(v) {this.toggleAttribute('switch-edit-mode-when-focused',v)}
    get switchViewModeWhenBlur() {return this.hasAttribute('switch-view-mode-when-blur');}
    set switchViewModeWhenBlur(v) {this.toggleAttribute('switch-view-mode-when-blur',v)}
    get switchEditModeWhenDnD() {return this.hasAttribute('switch-edit-mode-when-dnd');}
    set switchEditModeWhenDnD(v) {this.toggleAttribute('switch-edit-mode-when-dnd',v)}
    get showConfirmWhenDnD(){return this.hasAttribute('show-confirm-when-dnd');}
    set showConfirmWhenDnD(v) {this.toggleAttribute('show-confirm-when-dnd',v)}
    static get observedAttributes() {return ['mode','tab','switch-edit-mode-when-focused','switch-view-mode-when-blur','filename','newline','show-confirm-when-dnd'];}
    get defaultOptions() { return {
        mode: 'view', // 'view'/'edit'
        tab: {char:'\t', size:4},
        indent: {allowEmptyLines:false},
        file: {//テキスト出力設定（入力設定も用意するなら名前をどうするか。HTMLのattribute名も含めて）
            charset: 'utf-8', // utf-8(BOM無し)で固定
            newline: '\n',    // windowsだけ\r\n、他は\n
            tab: 'same',      // UI設定と統一する
            name: 'some-{now}.txt',
            lang: 'plain',
        },
    } }
    get mode() {return this._options.mode}
    set mode(v) {
        if (IndentTextAreaElement.Modes.includes(v)) {
            this._options.mode = v;
            this.readOnly = 'view'===v;
            this.disabled = false;
        }
    }
    get tabStr() {return '\t'===this.tabChar ? this.tabChar : this.tabChar.repeat(this.tabSize)}
    set tabStr(v) {
        if ('\t'===v) {this.tabChar=v;return;}
        let match = v.match(/^[ ]{2,8}$/);
        if (match) {this.tabChar=' ';this.tabSize=v.length;return;}
        match = v.match(/^(hard|soft|H|S|\t| )([2-8])$/);
        if (match) {this.#setStandardTab(parseInt(match[2]), ['soft','S',' '].some(v=>v===match[1]));return;}
        match = v.match(/^(.) ([2-8])$/);
        if (match) {
            this.tabChar = match[1];
            this.tabSize = parseInt(match[2]);
        }
        throw new TypeError(`tabの代入値は次の書式のみ有効です。\\t, /^[ ]{2,8}$/, /^(hard|soft|H|S|\t| )([2-8])$/, /^(.) ([2-8])$/: ${v}`)
    }
    get tabChar() {return this._options.tab.char}
    set tabChar(v) {if ('string'===typeof v || v instanceof String) {this._options.tab.char = v}}
    get tabSize() {return this._options.tab.size}
    set tabSize(v) {if (Number.isInteger(v) && 1 < v && v <= 8) {this._options.tab.size = v; this.style.tabSize = v;}}
    #setStandardTab(size=4, isSoft=false) {
        this.tabChar = isSoft ? ' ' : '\t';
        this.tabSize = size;
    }
    setHardTab(v) {this.tabChar='\t';if (Number.isInteger(v) && 0 < v && v <= 8) {this.tabSize=v}}
    setSoftTab(v) {this.tabChar=' ';if (Number.isInteger(v) && 0 < v && v <= 8) {this.tabSize=v}}
    get isTargetEmptyLines(){return this._isTargetEmptyLines}
    set isTargetEmptyLines(v){this._isTargetEmptyLines = !!v}
    get filename() {return this._options.file.name}
    set filename(v) {if (this.#isStr(v) && 0<v.length){this._options.file.name=v;}}
    #isStr(v) {return 'string'===typeof v || v instanceof String}
    get newline() {return this._options.file.newline}
    set newline(v) {if(this.#isStr(v) && '\n \r\n \r'.split(' ').some(V=>V===v)){this._options.file.newline=v}}
    /*
    setup(qs) {// qs:CSS selector ['textarea.indent', 'input.indent'] 等
        for (let el of document.querySelectorAll(qs ?? 'textarea')) {
            el.addEventListener('keydown', async(e)=>await this.onKeydown(e));
            this.#setupDnD(el, (value, ev) =>{console.log(el, value);el.value = value; el.focus();});
        }
    }
    */
    onFocus(event) {
        if(this.switchEditModeWhenFocused){
            if (this._switchEditModeFromDnD) {if(this.switchEditModeWhenDnD){this.mode='edit';this._switchEditModeFromDnD=false;}}
            else {this.mode='edit'}
        }
    }
    async onKeydown(e) {
        console.log(`enabled:${e.target.enabled} readOnly:${e.target.readOnly} disabled:${e.target.disabled} key:${e.key}`)
        if (e.isComposing) {return false}//IME入力時
        if (e.target.readOnly) {//VIEWモード時
            //スクロール
            if ('Up Down Left Right'.split(' ').some(v=>`Arrow${v}`===e.key) || 'Up Down'.split(' ').some(v=>`Page${v}`===e.key)){return}
            // ヘルプ
            if ('F1 ?'.split(' ').some(v=>v===e.key)){alert('これはインデント可能な<textarea>です。');e.preventDefault(); return false;}
            // 機能一覧、キーバインド

            // 更新(再読込)等
            if ([...new Array(12)].some(v=>`F${v}`===e.key)){return false}
            if ('n'===e.key){
                const name = prompt('ファイル名を入力してください。\n（{now}はタイムスタンプを意味するプレースホルダーです）', this._options.file.name);
                     if (null===name){}//ESCキー等でプロンプト入力をキャンセルした
                else if (0===name.trim().length) {this._options.file.name='some-{now}.txt'}
                else {this._options.file.name = name}
                e.preventDefault(); return;
            }
            if (('c'===e.key || 'C'===e.key) && 'undefined'!==typeof Clipboard){await Clipboard.write(e.target.value); return false;}
            if (('d'===e.key || 'D'===e.key) && 'undefined'!==typeof TextFile){TextFile.download(e.target.value, this._options.file.name.replace(/\{now\}/gm, ''.timestamp())); return false;}
            if ('Tab'!==e.key && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && 'Escape'!==e.key && ' '!==e.key && 'CapsLock'!==e.key) {e.preventDefault(); e.target.readOnly=false;}
            return false
        }
        else if (!e.target.disabled && !e.target.readOnly && 'Escape'===e.key) {e.preventDefault(); e.target.readOnly=true; return false;}
        if (e.keyCode !== 9) { return false }
        e.preventDefault();
        const [text, start, end] = this.#indent(e.target.value, e.target.selectionStart, e.target.selectionEnd, e.shiftKey);
        e.target.value = text;
        e.target.setSelectionRange(start, end);
        return false
    }
    indent(text, start=0, end=-1) {return this.#indent(text, start, end, false);}
    unindent(text, start=0, end=-1) {return this.#indent(text, start, end, true);}
    // 行頭か否か
    #isLineHead(text, start, end) {return 0===start ? true : '\n'===text.substring(start-1, start)}
    #indent(text, start=0, end=-1, isUn=false) {
        const slct = {start:start, end:end};
        const lineStart = text.substr(0, slct.start).split('\n').length - 1;
        const lineEnd = text.substr(0, slct.end).split('\n').length - 1;
        const lines = text.split('\n');
        // 範囲選択なし: カーソル位置の後にTAB字を挿入／カーソル位置の前にあるTAB字を削除
        // 範囲選択あり: 全行インデント／アンインデント
        //   次のように場合分けすることも考えたが、置換するよりカーソル途中位置でインデント／アンインデントするほうが要件に見合う
        //     改行を跨ぐ    :全行インデント／アンインデント
        //     改行を跨がない:１行選択範囲をインデント文字に置換する
        //if(slct.start == slct.end && !isUn) {
        if (slct.start === slct.end) {// 範囲選択なし
            if (isUn) {// アンインデント
                const S = end - this.tabStr.length;
                console.log(this.#isLineHead(text, start, end))
                console.log(`"${lines[lineStart]}"`)
                console.log(lines[lineStart].startsWith(this.tabStr))
                if (this.tabStr===text.substring(S, end)) {//カーソルの後にインデント文字がある
                    return [text.substring(0, S) + text.substring(S+this.tabStr.length),
                        start - this.tabStr.length, end - this.tabStr.length]
                } else if (this.#isLineHead(text, start, end) && lines[lineStart].startsWith(this.tabStr)) {
                    lines[lineStart] = lines[lineStart].substring(this.tabStr.length);
                    return [lines.join('\n'), start, end]
                } else {return [text, start, end]}// 何もしない
            } else {// インデント
                text = text.substring(0, slct.start) + this.tabStr + text.substring(slct.start, text.length);
                slct.start += this.tabStr.length;
                slct.end += this.tabStr.length;
                return [text, slct.start, slct.end]
            }
        } else {// 範囲選択あり
            for (let i=0; i<lines.length; i++) {
                if (i < lineStart || i > lineEnd || (!this._isTargetEmptyLines && lines[i] === '')) { continue }
                if (!isUn) {// 行頭にタブ挿入
                    lines[i] = this.tabStr + lines[i]
                    slct.start += i == lineStart ? this.tabStr.length : 0
                    slct.end += this.tabStr.length
                } else if (lines[i].substring(0, this.tabStr.length) === this.tabStr) {// 行頭のタブ削除
                    lines[i] = lines[i].substring(this.tabStr.length)
                    slct.start -= i == lineStart ? this.tabStr.length : 0
                    slct.end -= this.tabStr.length
                }
            }
            text = lines.join('\n')
            return [text, slct.start, slct.end];
        }
    }
    // https://gorogoronyan.web.fc2.com/htmlsample/src/TestJS_dnd_text_file01.html
    #setupDnD(callback) {
        this.addEventListener('drop', event => {
            event.preventDefault();
            //if (this.switchEditModeWhenDnD) {this._switchEditModeFromDnD=true}
            this._switchEditModeFromDnD=true;
            event.target.focus();
            event.target.classList.remove('dragging-file');
            if (event.target.readOnly){return}//閲覧モード時はキャンセル
            if (this.showConfirmWhenDnD && 0<event.target.value.length){if(!confirm('テキストエリアをファイル内容で上書きますか？')){return}}
            const file = event.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = event=>{this.value = event.target.result; this.focus();}
            reader.readAsText(file);
        });
        this.addEventListener('dragover', event => event.preventDefault());
        this.addEventListener('dragenter', event => {
            event.target.classList.add('dragging-file');
        });
        this.addEventListener('dragleave', event => {
            event.target.classList.remove('dragging-file');
        });
    }
}
customElements.define('edit-or-view', IndentTextAreaElement, {extends:'textarea'});
// <textarea is="edit-or-view"></textarea>
