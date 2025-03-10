//https://qiita.com/laineus/items/12a220d2ab086931232d
;(function(){
class TextareaIndent {
    constructor(isSoftTab=false, softTabSize=2) {
        this._isSoftTab = !!isSoftTab;
        this._softTabSize = Number.isInteger(softTabSize) ? softTabSize : 2;
        this._TAB_STR = isSoftTab ? ' '.repeat(this._softTabSize) : '\t';

        this._regexp = {
            remove: new RegExp(`^${'\t'===this._TAB_STR ? '\\t' : ' '.repeat(this._softTabSize)}`, 'gm'),
            append: new RegExp(`^(?=([^\n]|[^\r\n]|[^\r]))`, 'gm'),
        }
    }
    //get tab() {return this._isSoftTab ? ' '.repeat(this._softTabSize) : '\t'}
    get tab() {return this._TAB_STR}
    set tab(v) {
//        if (!v.match(/^([ ]{1,}|[\t])$/gm)) {throw new TypeError(`tabは半角スペース1個以上またはタブ1個のみ有効です:${v}`)}
        if ('\t'===v) {this._isSoftTab=false}
        else if (v.match(/^[ ]{1,}$/gm)) {
            this._isSoftTab = true;
            this._softTabSize = v.length;
        }
        else {throw new TypeError(`tabは半角スペース1個以上またはタブ1個のみ有効です:${v}`)}
        this._TAB_STR = isSoftTab ? ' '.repeat(this._softTabSize) : '\t';
        this._regexp.remove = new RegExp(`^${'\t'===this._TAB_STR ? '\\t' : ' '.repeat(this._softTabSize)}`, 'gm');
    }
    setup(qs) {// qs:CSS selector ['textarea.indent', 'input.indent'] 等
        for (let el of document.querySelectorAll(qs ?? 'textarea')) {
            el.addEventListener('keydown', async(e)=>this.keydown(e));
        }
    }
    keydown(e) {
        if (e.keyCode !== 9) { return false }
        e.preventDefault();
        //const [text, slct] = this.#indent(e.target.value, e.target.selectionStart, e.target.selectionEnd, e.shiftKey);
        const [text, slct] = this.#indent2(e.target.value, e.target.selectionStart, e.target.selectionEnd, e.shiftKey);
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
        if(slct.left == slct.right && !isUn) {
            text = text.substr(0, slct.left) + '\t' + text.substr(slct.left, text.length);
            slct.left++;
            slct.right++;
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
    #indent2(text, start=0, end=-1, isUn=false) {
        console.log('#indent2')
        if (end < 0) { end = text.length; } // 改行が見つからなければテキストの最後
        const l = end - start;
        //if (l <= 0) { return [text, start, end]; }// 空行は無視
        if (l <= 0 && !isUn) {
            text = text.substr(0, start) + '\t' + text.substr(start, text.length);
            return [text, start+1, end+2];
        }
        console.log('#indent2 A')
        const i = text.replace.apply(text.substr(start, l),
            isUn
            ? [this._regexp.remove, ''] // shiftキーが押されているときは行頭のタブ1文字か空白4文字までを削除
            : [this._regexp.append, this._TAB_STR]); // 押されていなければ行頭に空白4文字追加
//            ? [/^(?:this._TAB_STR)/gm, ''] // shiftキーが押されているときは行頭のタブ1文字か空白4文字までを削除
//            : [/^(?=[^\r\n])/gm, this._TAB_STR]); // 押されていなければ行頭に空白4文字追加
        console.log([text.substr(0, start) + i + text.substr(end), ({left:start, right:end + (i.length - l)})])
        return [text.substr(0, start) + i + text.substr(end), ({left:start, right:end + (i.length - l)})];
    }
}
window.TextareaIndent = TextareaIndent;
})();

