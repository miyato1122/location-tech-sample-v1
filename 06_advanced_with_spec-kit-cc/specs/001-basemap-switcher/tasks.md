# タスク: 背景地図切り替え機能

**入力**: `specs/001-basemap-switcher/` の設計ドキュメント
**前提条件**: plan.md（必須）, spec.md（必須）, research.md, data-model.md

**テスト**: 自動テストなし（憲法原則 III: 最低限テスト）。ブラウザ目視確認を最終フェーズで実施。

**編成**: ユーザーストーリーごとにタスクをグループ化し、各ストーリーを独立して実装・確認できる構成にする。

## フォーマット: `[ID] [P?] [Story?] 説明`

- **[P]**: 並行実行可能（異なるファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2）
- 説明には対象ファイルパスを含める

## パス規約

- リポジトリルート直下: `main.js`, `index.html`, `style.css`

---

## Phase 1: セットアップ

**目的**: 既存の動作確認と実装前の現状把握

- [x] T001 `npm run dev` で開発サーバーを起動し、現在の地図表示が正常に動作することを確認する

---

## Phase 2: 基盤整備（全ユーザーストーリーの前提）

**目的**: 背景地図切り替えに必要なMapLibreソース・レイヤー定義の追加

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの実装を開始してはならない

- [x] T002 `main.js` の MapLibre スタイル `sources` オブジェクトに地理院地図ソース（id: `gsi-std`, タイルURL: `https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png`, maxzoom: 18, attribution: 国土地理院リンク）を追加する
- [x] T003 [P] `main.js` の MapLibre スタイル `sources` オブジェクトに航空写真ソース（id: `gsi-photo`, タイルURL: `https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg`, maxzoom: 18, attribution: 国土地理院リンク）を追加する
- [x] T004 `main.js` の MapLibre スタイル `layers` 配列の先頭に地理院地図レイヤー（id: `gsi-std-layer`, source: `gsi-std`, type: `raster`, layout: `visibility: 'none'`）を追加する
- [x] T005 [P] `main.js` の MapLibre スタイル `layers` 配列の先頭に航空写真レイヤー（id: `gsi-photo-layer`, source: `gsi-photo`, type: `raster`, layout: `visibility: 'none'`）を追加する

**チェックポイント**: `npm run dev` で地図が正常に表示されること（見た目は変化しない）

---

## Phase 3: ユーザーストーリー1 - 背景地図の切り替え（優先度: P1）🎯 MVP

**ゴール**: ラジオボタンで3種類の背景地図を切り替えられるようにする

**独立テスト**: ラジオボタンをクリックして背景地図・出典表示が切り替わることをブラウザで確認する

### ユーザーストーリー1 の実装

- [x] T006 [US1] `main.js` の先頭付近に BASEMAPS 定数（3項目: osm/gsi-std/gsi-photo、各項目に id・label・layerId を定義）を追加する
- [x] T007 [P] [US1] `index.html` の `<body>` 内にラジオボタン切り替えコントロール `<div id="basemap-control">` を追加する（ラジオボタン3項目: OpenStreetMap・地理院地図・航空写真）
- [x] T008 [P] [US1] `style.css` に `#basemap-control` のスタイル（`position: absolute; bottom: 40px; left: 10px; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 4px; z-index: 1`）を追加する
- [x] T009 [US1] `main.js` に背景地図切り替え関数 `switchBasemap(id)` を実装する（BASEMAPS を走査して全レイヤーを `'none'` に設定後、選択レイヤーのみ `'visible'` に設定する）
- [x] T010 [US1] `main.js` で `document.querySelectorAll('#basemap-control input[type="radio"]')` の `change` イベントに `switchBasemap(e.target.value)` を呼び出すリスナーを追加する（`map.on('load', ...)` 内で設定）
- [x] T011 [US1] `index.html` の `<body>` 内にエラーメッセージ表示用 `<div id="tile-error-message">タイルの読み込みに失敗しました</div>` 要素を追加する
- [x] T012 [P] [US1] `style.css` に `#tile-error-message` のスタイル（`position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(200,0,0,0.8); color: white; padding: 8px 16px; border-radius: 4px; display: none; z-index: 10`）を追加する
- [x] T013 [US1] `main.js` に `map.on('error', handler)` を追加する（`e.sourceId` が `'gsi-std'` または `'gsi-photo'` または `'osm'` の場合に `#tile-error-message` を3秒間表示後に非表示にする）

**チェックポイント**: ラジオボタンで背景地図が切り替わり、右下の出典が連動して変化することをブラウザで確認できる

---

## Phase 4: ユーザーストーリー2 - 初期表示状態の維持（優先度: P2）

**ゴール**: ページ読み込み直後に OpenStreetMap がデフォルトで選択・表示される

**独立テスト**: ページをリロードして OpenStreetMap のラジオボタンが選択状態で地図が表示されることを確認する

### ユーザーストーリー2 の実装

- [x] T014 [US2] `index.html` の `#basemap-control` 内「OpenStreetMap」ラジオボタンに `checked` 属性を追加してデフォルト選択状態にする

**チェックポイント**: ページリロード後も OpenStreetMap がデフォルトで表示されること

---

## Phase 5: 動作確認・仕上げ

**目的**: 全受入シナリオの目視確認とビルド検証

- [x] T015 [P] `specs/001-basemap-switcher/quickstart.md` の確認手順（確認1〜6）に従い、ブラウザで全受入シナリオを確認する
- [x] T016 [P] `npm run build` を実行してプロダクションビルドがエラーなく完了することを確認する

---

## 依存関係と実行順序

### フェーズ依存関係

- **Phase 1（セットアップ）**: 依存なし、即座に開始可能
- **Phase 2（基盤整備）**: Phase 1 完了後 — 全ユーザーストーリーをブロック
- **Phase 3（US1）**: Phase 2 完了後に開始可能
- **Phase 4（US2）**: Phase 3 完了後に開始（T007 の index.html 変更に依存）
- **Phase 5（動作確認）**: Phase 4 完了後

### ユーザーストーリー内の依存関係

- T006 → T009（BASEMAPS 定数が切り替え関数の前提）
- T007 → T010（ラジオボタン要素が存在してからイベントリスナーを設定）
- T009 → T010（切り替え関数が実装されてからリスナーで呼び出す）
- T011 → T013（エラーメッセージ要素が存在してからイベントで操作）

### 並行実行可能なタスク

- T002 ‖ T003（同一ファイルの異なるキーへの追加）
- T004 ‖ T005（同一ファイルの異なるレイヤーへの追加）
- T006 ‖ T007 ‖ T008（main.js定数 / index.html / style.css は独立）
- T011 ‖ T012（index.html要素 / style.css スタイルは独立）
- T015 ‖ T016（最終確認は並行可能）

---

## 実装戦略

### MVP ファースト（ユーザーストーリー1のみ）

1. Phase 1: セットアップ完了
2. Phase 2: 基盤整備完了（必須 — 全ストーリーをブロック）
3. Phase 3: US1 実装
4. **停止・確認**: US1 を独立してテスト → ブラウザで切り替えが動作することを確認
5. 必要に応じてリリース/デモ

### インクリメンタルデリバリー

1. Phase 1 + Phase 2 完了 → 基盤準備OK
2. Phase 3（US1）完了 → ラジオボタン切り替えと出典更新が動作（MVP）
3. Phase 4（US2）完了 → デフォルト選択状態が確定
4. Phase 5 完了 → 全受入シナリオ確認済み

---

## 備考

- [P] タスクは異なるファイルへの変更または依存関係なし
- [Story] ラベルでタスクとユーザーストーリーのトレーサビリティを確保
- コードコメントは日本語で記述する（憲法原則 IV）
- テストは自動化せずブラウザ目視確認を主要な検証手段とする（憲法原則 III）
