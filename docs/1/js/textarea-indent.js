//https://qiita.com/laineus/items/12a220d2ab086931232d
;(function(){
class TextareaIndent {
    constructor(isSoftTab=false, softTabSize=2) {
        this._isSoftTab = !!isSoftTab;
        this._softTabSize = Number.isInteger(softTabSize) ? softTabSize : 2;
        this._TAB_STR = isSoftTab ? ' '.repeat(this._softTabSize) : '\t';
    }
    //get tab() {return this._isSoftTab ? ' '.repeat(this._softTabSize) : '\t'}
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
    setup(qs) {// qs:CSS selector ['textarea.indent', 'input.indent'] 等
        for (let el of document.querySelectorAll(qs ?? 'textarea')) {
            el.addEventListener('keydown', async(e)=>this.keydown(e));
        }
    }
    keydown(e) {
        if (e.keyCode !== 9) { return false }
        e.preventDefault();
        const [text, slct] = this.#indent(e.target.value, e.target.selectionStart, e.target.selectionEnd, e.shiftKey);
        e.target.value = text;
        e.target.setSelectionRange(slct.left, slct.right);
        return false
    }
    indent(text, start=0, end=-1) {return this.#indent(text, start, end, false);}
    unindent(text, start=0, end=-1) {return this.#indent(text, start, end, true);}
    #indent(text, start=0, end=-1, isUn=false) {
        const slct = {left:start, right:end};
        const lineStart = text.substr(0, slct.left).split('\n').length - 1;
        const lineEnd = text.substr(0, slct.right).split('\n').length - 1;
        const lines = text.split('\n');
        // 範囲選択なし
        // 範囲選択あり
        //   改行を跨ぐ    :全行インデント
        //   改行を跨がない:１行選択範囲をインデント文字に置換
        if(slct.left == slct.right && !isUn) {
            text = text.substr(0, slct.left) + this._TAB_STR + text.substr(slct.left, text.length);
            slct.left += this._TAB_STR.length;
            slct.right += this._TAB_STR.length;
            return [text, slct]
        } else {
            for (let i=0; i<lines.length; i++) {
                if (i < lineStart || i > lineEnd || lines[i] === '') { continue }
                if (!isUn) {// 行頭にタブ挿入
                    lines[i] = this._TAB_STR + lines[i]
                    slct.left += i == lineStart ? this._TAB_STR.length : 0
                    slct.right += this._TAB_STR.length
                } else if (lines[i].substr(0, this._TAB_STR.length) === this._TAB_STR) {// 行頭のタブ削除
                    lines[i] = lines[i].substr(this._TAB_STR.length)
                    slct.left -= i == lineStart ? this._TAB_STR.length : 0
                    slct.right -= this._TAB_STR.length
                }
            }
            text = lines.join('\n')
            return [text, slct];
        }
    }
}
window.TextareaIndent = TextareaIndent;
})();

