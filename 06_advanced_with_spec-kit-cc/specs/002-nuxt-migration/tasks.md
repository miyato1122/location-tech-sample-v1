# Tasks: Nuxtへの移行とライブラリ更新

**Input**: Design documents from `specs/002-nuxt-migration/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

**Organization**: ユーザーストーリー別にタスクを整理。各ストーリーは独立してテスト・デプロイ可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（別ファイル、未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2, US3）
- テストは仕様書で要求されていないため省略

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: nuxt-apps ディレクトリの作成と基本設定

- [ ] T001 `nuxt-apps/` ディレクトリに `npx nuxi@latest init nuxt-apps` を実行してNuxtプロジェクトを初期化する（パッケージマネージャー: npm）
- [ ] T002 `nuxt-apps/nuxt.config.ts` を編集して `ssr: false` を設定し、title/viewport の head 設定を追加する
- [ ] T003 [P] `nuxt-apps/assets/css/main.css` を新規作成し、現行 `style.css`（`#basemap-control` および `#tile-error-message` のスタイル）の内容を移行する

---

## Phase 2: Foundational（依存ライブラリ更新）

**Purpose**: 全ユーザーストーリーの前提となるライブラリ最新化

**⚠️ CRITICAL**: このフェーズ完了後にユーザーストーリーの実装を開始できる

- [ ] T004 `nuxt-apps/` で `npm install maplibre-gl@latest` を実行して maplibre-gl を最新安定版へ更新する
- [ ] T005 [P] `nuxt-apps/` で `npm install maplibre-gl-opacity@latest` を実行する
- [ ] T006 [P] `nuxt-apps/` で `npm install maplibre-gl-gsi-terrain@latest` を実行する
- [ ] T007 [P] `nuxt-apps/` で `npm install @turf/distance@latest` を実行する
- [ ] T008 `nuxt-apps/nuxt.config.ts` の `css` 配列に `maplibre-gl/dist/maplibre-gl.css`・`maplibre-gl-opacity/dist/maplibre-gl-opacity.css`・`~/assets/css/main.css` を追加する
- [ ] T009 `public/skhb/` ディレクトリとその中のタイルファイルを `nuxt-apps/public/skhb/` にコピーする（`cp -r ../public/skhb ./public/skhb`）

**Checkpoint**: 依存ライブラリ準備完了 → ユーザーストーリーの実装を開始できる

---

## Phase 3: User Story 1 - nuxt-apps での動作確認（Priority: P1）🎯 MVP

**Goal**: nuxt-apps で地図・背景地図切り替え・ハザードマップ・避難場所・GSI地形のすべての機能が動作することを確認する

**Independent Test**: `cd nuxt-apps && npm run dev` を起動し、`http://localhost:3000` でブラウザ目視確認（quickstart.md チェックリスト全項目）

### Implementation for User Story 1

- [ ] T010 [US1] `nuxt-apps/components/TheMap.vue` を新規作成し、`<template>` に `<div id="map" style="height:100vh">`・背景地図ラジオボタン UI・エラーメッセージ div を実装する
- [ ] T011 [US1] `nuxt-apps/components/TheMap.vue` の `<script setup>` に `onMounted()` を追加し、現行 `main.js` の `new maplibregl.Map({...})` 設定（sources・layers 全定義）を移植する。skhb タイル URL は `/skhb/{z}/{x}/{y}.pbf` 形式に変更する
- [ ] T012 [US1] `nuxt-apps/components/TheMap.vue` に `import { addProtocol } from 'maplibre-gl'` の named import を追加し、`useGsiTerrainSource(addProtocol)` 形式で GSI地形ソースと hillshade レイヤーを `map.on('load')` 内に実装する（research.md 参照）
- [ ] T013 [US1] `nuxt-apps/components/TheMap.vue` の `map.on('load')` に OpacityControl（ハザードマップ用・避難場所用それぞれ）を追加し、`map.addControl` で左上・右上に配置する
- [ ] T014 [US1] `nuxt-apps/components/TheMap.vue` に GeolocateControl を追加し、`_watchState` の代わりに `geolocationControl.on('trackuserlocationend', () => { userLocation = null })` イベントリスナーを使用して現在地管理を実装する（research.md 参照）
- [ ] T015 [US1] `nuxt-apps/components/TheMap.vue` の `map.on('click')` に避難場所のポップアップ表示ロジックを実装する
- [ ] T016 [US1] `nuxt-apps/components/TheMap.vue` の `map.on('mousemove')` にカーソル変更ロジックを実装する
- [ ] T017 [US1] `nuxt-apps/components/TheMap.vue` の `map.on('render')` に最寄り避難施設へのルートライン描画ロジックを実装する。`nearestFeature._geometry.coordinates` を `nearestFeature.geometry.coordinates` に修正する（research.md 参照）
- [ ] T018 [US1] `nuxt-apps/components/TheMap.vue` に `onUnmounted(() => map.remove())` を追加してメモリリークを防ぐ
- [ ] T019 [US1] `nuxt-apps/pages/index.vue` を新規作成し、`<TheMap />` をフルスクリーンで表示する
- [ ] T020 [US1] `cd nuxt-apps && npm run dev` を起動してブラウザで `http://localhost:3000` を開き、quickstart.md のチェックリスト全項目（地図表示・背景地図切り替え・ハザードマップ・避難場所・GSI地形）を目視確認する

**Checkpoint**: nuxt-apps で全機能が動作することをブラウザで確認済み

---

## Phase 4: User Story 2 - ライブラリ最新版の動作検証（Priority: P1）

**Goal**: 最新の maplibre-gl・@turf/distance 等で廃止予定API警告なし、プロダクションビルド成功を確認する

**Independent Test**: コンソールに警告・エラーなし。`npm run build` がエラーゼロで完了し、`npm run preview` でビルド成果物が動作する

### Implementation for User Story 2

- [ ] T021 [US2] `cd nuxt-apps && npm run dev` を起動したブラウザのコンソールで、廃止予定APIの警告・エラーが表示されないことを確認する。問題があれば `nuxt-apps/components/TheMap.vue` の該当箇所を修正する
- [ ] T022 [US2] `cd nuxt-apps && npm run build` を実行してプロダクションビルドがエラーゼロで完了することを確認する
- [ ] T023 [US2] `cd nuxt-apps && npm run preview` を実行してビルド成果物が正常に動作することをブラウザで確認する

**Checkpoint**: 最新ライブラリで警告なし・ビルド成功を確認済み

---

## Phase 5: User Story 3 - プロジェクトルートをNuxt構成へ置き換え（Priority: P2）

**Goal**: nuxt-apps での動作確認完了後、プロジェクトルートをNuxt構成に差し替え、ルートから `npm run dev` が起動できる状態にする

**Independent Test**: プロジェクトルート（`06_advanced_with_spec-kit-cc/`）から `npm run dev` を実行して全機能が動作する

**⚠️ PREREQUISITE**: Phase 3（US1チェックリスト全項目確認済み）・Phase 4（ビルド成功）完了後にのみ実施する

### Implementation for User Story 3

- [ ] T024 [US3] プロジェクトルートのバニラJS固有ファイル（`index.html`, `main.js`, `style.css`）を削除する
- [ ] T025 [US3] ルートの `package.json` を削除し、`nuxt-apps/package.json` および `nuxt-apps/package-lock.json` をプロジェクトルートにコピーする
- [ ] T026 [US3] `nuxt-apps/pages/`, `nuxt-apps/components/`, `nuxt-apps/assets/`, `nuxt-apps/public/skhb/`, `nuxt-apps/nuxt.config.ts` をプロジェクトルートにコピー/移動する
- [ ] T027 [US3] プロジェクトルートで `npm install` を実行して依存ライブラリをインストールする
- [ ] T028 [US3] プロジェクトルートで `npm run dev` を実行して動作確認し、全機能が nuxt-apps と同等に動作することをブラウザで確認する

**Checkpoint**: プロジェクトルートから単一の Nuxt 構成で全機能が動作することを確認済み

---

## Phase 6: Polish & クロスカッティング

**Purpose**: 移行後の整理と最終確認

- [ ] T029 [P] `nuxt-apps/` ディレクトリをプロジェクトルートへの置き換え完了後に削除する（US3完了後）
- [ ] T030 プロジェクトルートの `.gitignore` に `.nuxt/`, `.output/` を追加する（Nuxtのビルド成果物を除外）
- [ ] T031 変更内容を git add・git commit する（`git add` で specs/, nuxt-apps削除後のルートファイルを追加）

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Setup (Phase 1)**: 依存なし → すぐに開始可能
- **Foundational (Phase 2)**: Phase 1 完了後 → US1/US2 実装を BLOCK
- **US1 (Phase 3)**: Phase 2 完了後に開始（T004〜T009 完了が必要）
- **US2 (Phase 4)**: Phase 3 完了後（US1 の動作確認が前提）
- **US3 (Phase 5)**: Phase 3 + Phase 4 両方完了後にのみ実施
- **Polish (Phase 6)**: US3 完了後

### ユーザーストーリー依存関係

- **US1 (P1)**: Phase 2 完了後に開始 → 他ストーリーへの依存なし
- **US2 (P1)**: US1 完了後（コンソール確認・ビルド確認のため）
- **US3 (P2)**: US1 + US2 両方確認済みの場合のみ実施

### ストーリー内の依存関係

- T010 → T011 → T012〜T017（TheMap.vue の実装は順番に積み上げ）
- T018 は T011〜T017 完了後
- T019（index.vue）は T010 のテンプレート作成後に並列実行可能
- T020（ブラウザ確認）は T010〜T019 すべて完了後

### 並列実行可能

- T003: CSS 作成（Phase 1 内で独立）
- T005・T006・T007: 各ライブラリインストール（Phase 2 内で並列可能）

---

## Parallel Example: Phase 2（ライブラリインストール）

```bash
# Phase 2 内で並列実行可能:
Task T005: npm install maplibre-gl-opacity@latest
Task T006: npm install maplibre-gl-gsi-terrain@latest
Task T007: npm install @turf/distance@latest
```

---

## Implementation Strategy

### MVP First（US1 のみ）

1. Phase 1 完了: nuxt-apps 作成
2. Phase 2 完了: ライブラリ最新化（CRITICAL）
3. Phase 3 完了: nuxt-apps で全機能確認
4. **STOP and VALIDATE**: quickstart.md チェックリスト確認
5. 問題なければ US2 → US3 へ進む

### Incremental Delivery

1. Setup + Foundational → nuxt-apps 環境準備完了
2. US1（Phase 3）→ ブラウザ確認 → MVP！
3. US2（Phase 4）→ ビルド確認 → ライブラリ更新完了
4. US3（Phase 5）→ ルート置き換え → 最終形

---

## Notes

- [P] タスクは別ファイル・依存なしのため並列実行可能
- [Story] ラベルはトレーサビリティのためにユーザーストーリーと紐付け
- US1 の全チェックリスト確認なしに US3 へ進まないこと
- maplibre-gl-opacity が v5 非互換の場合: `map.setLayoutProperty` / `map.setPaintProperty` を使った独自実装に切り替える（research.md 参照）
- `_watchState` および `_geometry` は必ず標準APIに置き換えること（research.md 参照）
