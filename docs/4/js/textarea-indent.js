//https://qiita.com/laineus/items/12a220d2ab086931232d
;(function(){
class TextareaIndent {
    constructor(isSoftTab=false, softTabSize=2, isTargetEmptyLines=false) {
        this._isSoftTab = !!isSoftTab;
        this._softTabSize = Number.isInteger(softTabSize) ? softTabSize : 2;
        this._TAB_STR = isSoftTab ? ' '.repeat(this._softTabSize) : '\t';
        this._isTargetEmptyLines = isTargetEmptyLines;
    }
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
    get isTargetEmptyLines(){return this._isTargetEmptyLines}
    set isTargetEmptyLines(v){this._isTargetEmptyLines = !!v}
    setHardTab() {this.tab='\t'}
    setSoftTab(v) {
        if (Number.isInteger(v) && 0 < v && v <= 8) {this.tab=' '.repeat(v)}
        else {this.tab='\t'} // 異常値なら
    }
    setup(qs) {// qs:CSS selector ['textarea.indent', 'input.indent'] 等
        for (let el of document.querySelectorAll(qs ?? 'textarea')) {
            el.addEventListener('keydown', async(e)=>this.keydown(e));
        }
    }
    keydown(e) {
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

