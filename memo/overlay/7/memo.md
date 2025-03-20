# TextAreaにoverlayする

　私は`<textarea>`に重ねて`<button>`や`<input>`を配置したかった。これは画面領域を節約しつつ、スマホのようにキーボード入力できないデバイス用への対処でもある。

　ただ、画面の上右端や、下中端に配置しくても、HTMLやCSSが複雑に絡み合ってどうコードを書けばいいか判らない。

```
+--------------------------+
|TextArea     📋📄□👀/✒ ？|
|                          |
|                          |
|                          |
|                          |
|      +-------------+     |
|      |some-{id}.txt|     |
+------+-------------+-----+
```

No|`Z-index`|`X,Y`|要素
--|---------|-----|----
1|一番下|全体|`<textarea>`
2|1の上|上右端|`<button>`群
3|1の上|下中端|`<input>`

　CSSの`position`値である`relative`と`absorute`を使い、`top:0`,`bottom:0`,`left:0`,`right:0`等で位置を指定する。

　このとき、DOM構造が変わると効かなくなってしまう。また、微妙に位置がズレる。さらに配置用divが必要になり、クリック透過しないと下の`<textarea>`をアクティブにできない問題がある。次々と問題が波及し肥大化していく。

　`textarea overlay`というキーワードで検索すると以下二件を発見した。

* [LLMによる添削機能付きエディタをWebブラウザで動かしたいなら、textarea overlayを使え！][]
* [Facebookみたいにtextareaの一部を強調する][]

　`html css クリック透過`というキーワードで検索すると以下を発見した。

* [特定の要素をマウスイベントが透過するようにしたい][]

[LLMによる添削機能付きエディタをWebブラウザで動かしたいなら、textarea overlayを使え！]:https://zenn.dev/piyoketa/articles/4934d9c4e1fa5e
[Facebookみたいにtextareaの一部を強調する]:https://qiita.com/yuku_t/items/516ec6fe59b77b93edc5
[特定の要素をマウスイベントが透過するようにしたい]:https://ja.stackoverflow.com/questions/33427/%E7%89%B9%E5%AE%9A%E3%81%AE%E8%A6%81%E7%B4%A0%E3%82%92%E3%83%9E%E3%82%A6%E3%82%B9%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%81%8C%E9%80%8F%E9%81%8E%E3%81%99%E3%82%8B%E3%82%88%E3%81%86%E3%81%AB%E3%81%97%E3%81%9F%E3%81%84

　親要素をリサイズしたらoverlay要素も同じサイズでリサイズしたい。そこでResizeObserverを使用した所、無限ループに陥った。おそらく内部要素をリサイズしたら親要素もリサイズされ、親要素がリサイズされたら内部要素もリサイズされ、という無限ループだと思われる。イベント発火時はデフォルトの再描画処理を抑制できれば無限ループを回避できると思うが、どうやって抑制するのか。

　[content-visibility][]で再描画を抑制した。

[content-visibility]:https://developer.mozilla.org/ja/docs/Web/CSS/content-visibility

## OverlayBox

　任意の要素に対してoverlayするUIライブラリを作りたい。

　次の9箇所の相対位置を指定できるものとする。

```
+-----+-----+-----+-----+-----+
|  0  |     |  1  |     |  2  |
+-----+     +-----+     +-----+
|                             |
+-----+     +-----+     +-----+
|  3  |     |  4  |     |  5  |
+-----+     +-----+     +-----+
|                             |
+-----+     +-----+     +-----+
|  6  |     |  7  |     |  8  |
+-----+-----+-----+-----+-----+
```

i|name1|name2
-|-----|-----
0|NorthWest|TopLeft
1|North|Top
2|NorthEast|TopRight
3|West|Left
4|Center|Center
5|East|Right
6|SouthWest|BottomLeft
7|South|Bottom
8|SouthEast|BottomRight

```javascript
new OverlayBox({
    topRight: document.createElement('div'),
    bottom: document.createElement('div'),
});
```
```javascript
const editor = document.createElement('div');
const ta = document.createElement('textarea');
const overlay = new OverlayBox({
    topRight: document.createElement('div'),
    bottom: document.createElement('div'),
});
editor.append(ta, overlay);
```


## 別アプローチ

### GridLayout

　GridLayoutだと以下のようになってしまい、端にならない。また、内容のサイズが大きくても他の領域まで伸長してくれず三等分サイズが最大になってしまう。要件とは合わないため、この方法は使えない。

```
+-------+-------+-------+
|       |       |       |
|   0   |   1   |   2   |
|       |       |       |
+-------+-------+-------+
|       |       |       |
|   3   |   4   |   5   |
|       |       |       |
+-------+-------+-------+
|       |       |       |
|   6   |   7   |   8   |
|       |       |       |
+-------+-------+-------+
```


