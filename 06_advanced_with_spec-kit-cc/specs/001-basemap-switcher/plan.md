# 実装計画: 背景地図切り替え機能

**ブランチ**: `001-basemap-switcher` | **作成日**: 2026-04-22 | **仕様書**: [spec.md](spec.md)
**入力**: [specs/001-basemap-switcher/spec.md](spec.md)

## サマリー

画面左下にラジオボタン形式の背景地図切り替えコントロールを追加する。
切り替え対象は OpenStreetMap・地理院地図・航空写真の3種類。
MapLibre GL JS のレイヤー可視性切り替えAPI（`setLayoutProperty`）を使用し、
地図右下の出典（attribution）は可視レイヤーと連動して自動更新される。

## 技術コンテキスト

**言語/バージョン**: JavaScript (ES Modules) / ES2020+
**主要依存ライブラリ**: MapLibre GL JS v2.4.0, maplibre-gl-opacity v1.4.0, Vite v3.2.0
**ストレージ**: N/A（データ永続化なし）
**テスト**: ブラウザ目視確認（手動テスト）
**ターゲット環境**: モダンブラウザ（Chrome・Firefox・Safari 最新版）
**プロジェクト種別**: Web アプリケーション（SPA）
**パフォーマンス目標**: 切り替え操作から UI 反映まで 500ms 以内
**制約**: 新規ライブラリ追加なし
**スコープ**: シングルユーザー向けデモアプリ

## 憲法チェック

*ゲート: Phase 0 リサーチ前に通過必須。Phase 1 設計後に再確認。*

| 原則 | ステータス | 確認内容 |
| ------ | ---------- | --------- |
| I. 仕様書ファースト | ✅ 通過 | spec.md が完成・明確化済み |
| II. 地図・位置情報中心設計 | ✅ 通過 | MapLibre GL JS のラスタータイルを使用 |
| III. 最低限テスト | ✅ 通過 | 自動テストなし、ブラウザ目視確認のみ |
| IV. 日本語ドキュメント | ✅ 通過 | plan.md・コードコメントを日本語で記述 |
| V. シンプルさ優先 | ✅ 通過 | 新規ライブラリなし、既存ファイルへの最小追記 |

**Phase 1 設計後の再確認**: ✅ 全原則通過継続

## プロジェクト構造

### ドキュメント（本フィーチャー）

```text
specs/001-basemap-switcher/
├── plan.md         # 本ファイル
├── research.md     # Phase 0 リサーチ結果
├── data-model.md   # データモデル
├── quickstart.md   # 動作確認手順
└── tasks.md        # タスクリスト（/speckit-tasks で生成）
```

### ソースコード変更対象

```text
index.html          # ラジオボタンコントロールの HTML を追加
main.js             # 背景地図ソース定義・切り替えロジック・エラーハンドリングを追加
style.css           # 切り替えコントロールの CSS スタイルを追加
```

**構造決定**: 既存の単一ファイル構成（`main.js` / `index.html` / `style.css`）を維持し、
新規ファイル・ディレクトリは作成しない。YAGNI 原則に従い最小変更にとどめる。

## 実装方針の詳細

### 1. 初期スタイル定義への追加

`main.js` の MapLibre スタイル `sources` に地理院地図・航空写真の2ソースを追加する。

```javascript
// 地理院地図ソース（新規追加）
'gsi-std': {
    type: 'raster',
    tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
    maxzoom: 18,
    tileSize: 256,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
},
// 航空写真ソース（新規追加）
'gsi-photo': {
    type: 'raster',
    tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
    maxzoom: 18,
    tileSize: 256,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
},
```

スタイル `layers` の先頭に地理院地図・航空写真レイヤーを `visibility: 'none'` で追加する。

### 2. ラジオボタンコントロール

`index.html` に `<div id="basemap-control">` を追加する。
`style.css` で `position: absolute; bottom: 40px; left: 10px` に固定する。

### 3. 切り替えロジック

`main.js` に背景地図切り替え関数を追加する。
ラジオボタンの `change` イベントで各背景レイヤーの visibility を設定する。

### 4. エラーハンドリング

`map.on('error', ...)` で背景地図ソースのタイル読み込みエラーを検知し、
「タイルの読み込みに失敗しました」メッセージを一定時間表示する。

## 複雑性トラッキング

> 憲法違反なし。記入不要。
