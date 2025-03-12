//https://qiita.com/laineus/items/12a220d2ab086931232d
;(function(){
class TextareaIndent {
    /*
    static Modes = Object.freeze({
        Enabled: 0,
        ReadOnly: 1,
        Disabled: 2,
    });
    */
    //constructor(isSoftTab=false, softTabSize=2, isTargetEmptyLines=false, mode=0) {
    constructor(options) {
        this._options = {...this.defaultOptions, ...options}
        this._options.isSoftTab = !!this._options.isSoftTab;
        this._options.softTabSize = Number.isInteger(this._options.softTabSize) ? this._options.softTabSize : 2;
        this._options.TAB_STR = this._isSoftTab ? ' '.repeat(this._options.softTabSize) : '\t';
        this._options.isTargetEmptyLines = !!this._options.isTargetEmptyLines;
//        this._options.mode = [...Object.values(TextareaIndent.Modes)].some(v=>v===options.mode) ? options.mode : TextareaIndent.Modes.Enabled;
    }
    get defaultOptions() { return {
        isSoftTab: false,
        softTabSize: 2,
        isTargetEmptyLines: false,
//        mode: TextareaIndent.Modes.Enabled,
        name: 'some-{now}.txt',
    } }
    get tab() {return this._TAB_STR}
    set tab(v) {
        if ('\t'===v) {this._isSoftTab=false}
        else if (v.match(/^[ ]{1,}$/gm)) {
            this._isSoftTab = true;
            this._softTabSize = v.length;
        }
        else {throw new TypeError(`tabは半角スペース1個以上またはタブ1個のみ有効です:${v}`)}
        this._TAB_STR = this._isSoftTab ? ' '.repeat(this._softTabSize) : '\t';
    }
    setHardTab() {this.tab='\t'}
    setSoftTab(v) {
        if (Number.isInteger(v) && 0 < v && v <= 8) {this.tab=' '.repeat(v)}
        else {this.tab='\t'} // 異常値なら
    }
    get isTargetEmptyLines(){return this._isTargetEmptyLines}
    set isTargetEmptyLines(v){this._isTargetEmptyLines = !!v}
//    get mode() {return this._options.mode}
//    set mode(v) {this._options.mode = [...Object.values(TextareaIndent.Modes)].some(V=>V===v) ? v : TextareaIndent.Modes.Enabled;}
    setup(qs) {// qs:CSS selector ['textarea.indent', 'input.indent'] 等
        for (let el of document.querySelectorAll(qs ?? 'textarea')) {
            el.addEventListener('keydown', async(e)=>await this.keydown(e));
        }
    }
    async keydown(e) {
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
                const name = prompt('ファイル名を入力してください。\n（{now}はタイムスタンプを意味するプレースホルダーです）', this._options.name);
                     if (null===name){}//ESCキー等でプロンプト入力をキャンセルした
                else if (0===name.trim().length) {this._options.name='some-{now}.txt'}
                else {this._options.name = name}
                e.preventDefault(); return;
            }
            if (('c'===e.key || 'C'===e.key) && 'undefined'!==typeof Clipboard){await Clipboard.write(e.target.value); return false;}
            if (('d'===e.key || 'D'===e.key) && 'undefined'!==typeof TextFile){TextFile.download(e.target.value, this._options.name.replace(/\{now\}/gm, ''.timestamp())); return false;}
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
    /*
    get #isLineHead(text, start, end) {// 行頭か否か
        return 0===start
            ? true
            : '\n'===text.substring(start-1, start)
//        if (0===start) {return true}
//        else {return '\n'===text.substring(start-1, start)}
    }
    */
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
                const S = end - this._TAB_STR.length;
//                console.log(`end..S+1:"${text.substring(end, S+1)}"`, end, S+1)
//                console.log(`"${text.substring(end-this._TAB_STR.length, end+1)}"`)
                console.log(this.#isLineHead(text, start, end))
                console.log(`"${lines[lineStart]}"`)
                console.log(lines[lineStart].startsWith(this._TAB_STR))
                if (this._TAB_STR===text.substring(S, end)) {//カーソルの後にインデント文字がある
                    return [text.substring(0, S) + text.substring(S+this._TAB_STR.length),
                        start - this._TAB_STR.length, end - this._TAB_STR.length]
//                } else if (this._TAB_STR===text.substring(end-this._TAB_STR.length, end+1)) {
//                    console.log('AAAAAAAAAA:', end, text.substring(end-this._TAB_STR.length, end+1))
//                    return [text.substring(0, end-this._TAB_STR.length) + text.substring(end),
//                        start - this._TAB_STR.length, end - this._TAB_STR.length]
                // 行頭でカーソル前にインデント文字がある
//                } else if (0===end && this._TAB_STR===text.substring(0, this._TAB_STR.length)) {
//                    return [text.substring(this._TAB_STR.length), 0, 0]
//                } else if (this._TAB_STR===text.substring(end-this._TAB_STR.length, end+1)) {
//                    return [text.substring(this._TAB_STR.length), Math.max(0, start-this._TAB_STR.length), Math.max(0, end-this._TAB_STR.length)]
                } else if (this.#isLineHead(text, start, end) && lines[lineStart].startsWith(this._TAB_STR)) {
                    //return [text.substring(this._TAB_STR.length), start, end]
                    lines[lineStart] = lines[lineStart].substring(this._TAB_STR.length);
                    return [lines.join('\n'), start, end]
                } else {return [text, start, end]}// 何もしない
            } else {// インデント
                text = text.substring(0, slct.start) + this._TAB_STR + text.substring(slct.start, text.length);
                slct.start += this._TAB_STR.length;
                slct.end += this._TAB_STR.length;
                return [text, slct.start, slct.end]
            }
        } else {// 範囲選択あり
            for (let i=0; i<lines.length; i++) {
                if (i < lineStart || i > lineEnd || (!this._isTargetEmptyLines && lines[i] === '')) { continue }
                if (!isUn) {// 行頭にタブ挿入
                    lines[i] = this._TAB_STR + lines[i]
                    slct.start += i == lineStart ? this._TAB_STR.length : 0
                    slct.end += this._TAB_STR.length
                } else if (lines[i].substring(0, this._TAB_STR.length) === this._TAB_STR) {// 行頭のタブ削除
                    lines[i] = lines[i].substring(this._TAB_STR.length)
                    slct.start -= i == lineStart ? this._TAB_STR.length : 0
                    slct.end -= this._TAB_STR.length
                }
            }
            text = lines.join('\n')
            return [text, slct.start, slct.end];
        }
    }
}
window.TextareaIndent = TextareaIndent;
})();

