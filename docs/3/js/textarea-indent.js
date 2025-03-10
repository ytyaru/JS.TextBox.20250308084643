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
    setSoftTab(v) {this.tab=' '.repeat(Number.isInteger(v) ? v : 2)}
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
            if (isUn) {
                const S = end - this._TAB_STR.length;
                if (this._TAB_STR===text.substring(S, end)) {
                    return [text.substring(0, S) + text.substring(S+this._TAB_STR.length),
                        start - this._TAB_STR.length, end - this._TAB_STR.length]
                } else {return [text, start, end]}// 何もしない
            } else {
                text = text.substring(0, slct.start) + this._TAB_STR + text.substring(slct.start, text.length);
                slct.start += this._TAB_STR.length;
                slct.end += this._TAB_STR.length;
                return [text, slct.start, slct.end]
            }
        } else if(slct.start === slct.end && !isUn) {
        } else {
            for (let i=0; i<lines.length; i++) {
                //if (i < lineStart || i > lineEnd || lines[i] === '') { continue }
                //if (i < lineStart || i > lineEnd) { continue } // 空行もインデント対象
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

