# Overlay Menu

　テキストエリアの上に描画するメニューボタン等について。

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

icon|name
----|----
📋|clipboard copy
📄|file download
□|full screen
👀/✒ |switch mode(VIEW/EDIT(Read/Write))
？|show help
□|filename

## Hide

　メニュー画面を表示しない。

```css
display: none;
```

## Show

　メニュー画面を表示する。

```css
display: block;
```

　表示内容は設定によって変えられる。

* ヘルプのみ（ヘルプ画面から各機能の実行や表示設定切替可）
* 全項目表示

### Only help

　ヘルプ画面のみアイコン表示する

```md
# Help

　本アプリ`<text-editor>`は`<textarea>`をベースにしたUIです。モード切替によって`Tab`キーの挙動をインデント／フォーカス遷移に切り替えることができます。

モード|`Tab`|`Shift`+`Tab`
------|-----|-------------
👀📖 VIEW 閲覧|次の要素へフォーカス|前の要素へフォーカス
✒    EDIT 編集|インデント|アンインデント

機能|表示|概要
----|----|----
📋Copy|☑ |入力内容をクリップボードにコピーする
📄Download|☑ |入力内容をファイルとしてダウンロードする
□FullScreen|☑ |全画面表示／解除する
？Help|☑ |本ページを表示／非表示する
🔖FileName|ダウンロードするファイル名を入力する

　以下機能は対象外。途中で変更して混在すると扱いにくくなるから。

機能|表示|概要
----|----|----
…Tab|インデント文字を指定する

[HardTab▼][2▼]
 SoftTab    4
            8

## Key bind

### EDITモード時

Key|機能
---|----
`Tab`|インデントする
`Shift`+`Tab`|アンインデントする
`Esc`|👀VIEW

### VIEWモード時

Key|機能
---|----
`c`|📋Copy
`d`|📄Download
`?`,`F1`|？Help
`F11`|□FullScreen
`F2`|□FileName
`Enter`等|✒ EDIT

　他にも以下デフォルト機能が有効である。

Key|機能
---|----
`Tab`|次の要素へフォーカスする
`Shift`+`Tab`|前の要素へフォーカスする
`↑`,`↓`,`←`,`→`,`Space`,`PgUp`,`PgDn`,`Home`,`End`|スクロール

### FullScreen時

Key|機能
---|----
`Esc`,`F11`|FullScreen解除

```

## Command

名|
--|
`copy`
`download`
`switchFullScreen`
`switchMode`
`setEditMode`
`setViewMode`
`switchShowHelp`
`showHelp`
`hideHelp`

## Property

名|概要|例
--|----|--
`fileName`|ファイル名|`some-{now}.txt`
`tab`|インデント文字|`\t`, `    `,`　　`,...
`newline`|改行文字|`\n`,`\r\n`,`\r`

``

```
copy
download

```

