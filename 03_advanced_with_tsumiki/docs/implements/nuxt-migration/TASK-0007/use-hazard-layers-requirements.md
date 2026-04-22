# useHazardLayers Composable 要件定義書

**タスクID**: TASK-0007  
**機能名**: useHazardLayers composable実装  
**要件名**: nuxt-migration  
**作成日**: 2026-04-21  
**関連要件**: REQ-020, REQ-021  

---

## 1. 機能の概要

### 何をする機能か 🔵

**信頼性**: 🔵 *REQ-020, REQ-021 + 既存実装 main.js:35-174より*

6種のハザードマップ（洪水・高潮・津波・土石流・急傾斜地・地滑り）のラスタータイルレイヤーをMapLibre GLマップに追加し、`maplibre-gl-opacity` の `OpacityControl` を使用して表示/非表示・不透明度の制御UIを提供するcomposable関数。

### どのような問題を解決するか 🔵

**信頼性**: 🔵 *ユーザーストーリー + REQ-020より*

- 既存の `main.js` に散在していたハザードマップレイヤーの追加・制御ロジックを、単一のcomposable関数に集約する
- 防災マップのユーザーが各種ハザード情報を重ね合わせ表示することで、居住地・避難経路の危険度を視覚的に確認できるようにする

### 想定されるユーザー 🔵

**信頼性**: 🔵 *ユーザーストーリーより*

- 防災マップを閲覧するエンドユーザー（住民・防災担当者）
- `MapContainer.vue` からcomposableを呼び出す開発者

### システム内での位置づけ 🔵

**信頼性**: 🔵 *architecture.md Composables表より*

- **配置**: `composables/useHazardLayers.ts`
- **呼び出し元**: `MapContainer.vue`（TASK-0013で統合）
- **依存先**: `useMap` composable（TASK-0006）が提供するマップインスタンス
- **後続タスク**: TASK-0013（MapContainer.vue統合）
- **レイヤー定義データ**: `config/map.ts` の `HAZARD_LAYERS` 定数

**参照したEARS要件**: REQ-020, REQ-021  
**参照した設計文書**: architecture.md - Composables表, provide/injectパターン

---

## 2. 入力・出力の仕様

### 入力パラメータ 🔵（既存実装ベースで修正あり）

**信頼性**: 🔵 *既存実装 `composables/useHazardLayers.ts` より確認済み*

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `map` | `Readonly<Ref<MapInstance \| null>>` | 必須 | MapLibre GLマップインスタンスのRef |
| `isLoaded` | `Readonly<Ref<boolean>>` | 必須 | マップのload完了フラグ |

> **注意: 設計文書との差異**
> 
> - **設計文書（TASK-0007.md）**: `map.value?.on('load', () => { ... })` パターンを想定し、引数は `map: Ref<MaplibreMap | null>` のみ
> - **既存実装（04_advanced_with_cc-sdd）**: `watchEffect` + `isLoaded` パターンを採用し、引数は `map` と `isLoaded` の2つ
> - **本要件定義**: 既存実装のパターンを優先採用する。`watchEffect` + `isLoaded` はリアクティブに状態変化を監視でき、Vueのcomposableパターンとしてより適切であるため

### 出力（戻り値） 🔵

**信頼性**: 🔵 *既存実装より確認済み*

| 戻り値 | 型 | 説明 |
|--------|------|------|
| なし | `void` | 副作用のみ（マップにレイヤー・コントロールを追加） |

### 副作用 🔵

**信頼性**: 🔵 *REQ-020, REQ-021 + 既存実装より*

1. マップに6つのラスタータイルソースを追加（`map.addSource`）
2. マップに6つのラスターレイヤーを追加（`map.addLayer`、デフォルト `visibility: 'none'`）
3. `OpacityControl` を `'top-left'` 位置に追加（`map.addControl`）

### データフロー 🔵

**信頼性**: 🔵 *architecture.md + 既存実装より*

```
MapContainer.vue
  ├─ useMap() → map: Ref<MapInstance>, isLoaded: Ref<boolean>
  └─ useHazardLayers(map, isLoaded)
       ├─ watchEffect: isLoaded === true のとき実行
       ├─ HAZARD_LAYERS.forEach → map.addSource + map.addLayer (×6)
       └─ new OpacityControl({ baseLayers }) → map.addControl('top-left')
```

**参照したEARS要件**: REQ-020, REQ-021  
**参照した設計文書**: interfaces.ts - `HazardLayerConfig`, config/map.ts - `HAZARD_LAYERS`

---

## 3. 制約条件

### 型定義制約 🔵

**信頼性**: 🔵 *既存実装の型定義ファイルより確認済み*

- **マップインスタンス型**: `MapInstance`（`types/map.ts` で定義された最小インターフェース）を使用
  - 既存実装では `maplibre-gl` の `Map` 型を直接使用せず、独自の最小インターフェース `MapInstance` を定義
  - これは maplibre-gl v5.23.0 の型定義と TypeScript の互換性問題を回避するため
- **レイヤー設定型**: `HazardLayerConfig`（`types/map.ts`）を使用
- **レイヤー定数**: `HAZARD_LAYERS`（`config/map.ts`）からインポート

> **注意: インポートパスの差異**
> 
> - **設計文書（interfaces.ts）**: `HAZARD_LAYER_DEFINITIONS` を `~/types` からインポートする想定
> - **既存実装**: `HAZARD_LAYERS` を `~/config/map` からインポート、型定義は `~/types/map` に分離
> - **本要件定義**: 既存実装のパターン（`~/config/map` + `~/types/map`）を採用

### アーキテクチャ制約 🔵

**信頼性**: 🔵 *architecture.md + REQ-002より*

- SSR無効化（`ssr: false`）環境でのみ動作を保証
- composableは `MapContainer.vue` 内で呼び出される（引数渡しパターン）
- `maplibre-gl-opacity` はVanilla JSライブラリとしてそのまま使用（Vueコンポーネント化しない）

### OpacityControl API制約 🔵

**信頼性**: 🔵 *既存実装で動作確認済み*

- `maplibre-gl-opacity` v1.8.0 では `baseLayers` プロパティを使用
  - 旧バージョン（v1.4.0）の `overLayers` から変更されている
  - 既存実装で `baseLayers` の使用が確認済み
- コンストラクタ: `new OpacityControl({ baseLayers: Record<string, string> })`
- `baseLayers` のキーはレイヤーID、値は表示ラベル

### パフォーマンス制約 🟡

**信頼性**: 🟡 *NFR-001から妥当な推測*

- 6種のレイヤーを一括追加（`map.addSource` × 6 + `map.addLayer` × 6）
- デフォルト `visibility: 'none'` により初期表示パフォーマンスへの影響を最小化
- ラスタータイルはユーザーが表示を有効にした時点でのみGSIサーバーからフェッチ

### 法的制約 🔵

**信頼性**: 🔵 *NFR-401より*

- 各ラスターソースに `attribution` を必ず設定
- GSI著作権表示: `<a href="https://disaportal.gsi.go.jp/">国土地理院ハザードマップポータルサイト</a>`

### TypeScript制約 🔵

**信頼性**: 🔵 *REQ-003 + nuxt.config.ts設定より*

- `typescript: { strict: true }` でコンパイルエラーなし
- non-null assertion (`!`) の使用を最小限に抑える
- optional chaining (`?.`) を活用

**参照したEARS要件**: REQ-002, REQ-003, REQ-020, REQ-021, NFR-001, NFR-401  
**参照した設計文書**: architecture.md - SSR禁止制約, types/map.ts, config/map.ts

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン 🔵

**信頼性**: 🔵 *REQ-020 + architecture.md provide/injectパターンより*

```typescript
// MapContainer.vue 内での使用
import { useHazardLayers } from '~/composables/useHazardLayers'

const { map, isLoaded } = useMap('map-container')
useHazardLayers(map, isLoaded)
```

**期待される動作**:
1. マップのload完了後（`isLoaded.value === true`）、`watchEffect` が発火
2. `HAZARD_LAYERS` 配列（6件）をループし、各レイヤーのソースとレイヤーを追加
3. 全レイヤーのデフォルト表示状態: `visibility: 'none'`（非表示）
4. `OpacityControl` が左上に追加され、ユーザーが各レイヤーの表示/不透明度を切り替え可能

### 4.2 レイヤー追加の詳細フロー 🔵

**信頼性**: 🔵 *既存実装 config/map.ts + main.js:35-174より*

各ハザードレイヤーについて以下を実行:

1. **ソース追加** (`map.addSource`):
   - `sourceId`: `HAZARD_LAYERS[i].sourceId`（例: `'hazard_flood'`）
   - `type`: `'raster'`
   - `tiles`: `[HAZARD_LAYERS[i].tileUrl]`
   - `tileSize`: `256`
   - `attribution`: GSI著作権表示テキスト

2. **レイヤー追加** (`map.addLayer`):
   - `id`: `HAZARD_LAYERS[i].layerId`（例: `'hazard_flood-layer'`）
   - `type`: `'raster'`
   - `source`: `HAZARD_LAYERS[i].sourceId`
   - `paint`: `{ 'raster-opacity': HAZARD_LAYERS[i].opacity }`（0.7）
   - `layout`: `{ visibility: 'none' }`

3. **OpacityControl追加**:
   - `baseLayers` オブジェクト: `{ [layerId]: label }` × 6件
   - 位置: `'top-left'`

### 4.3 mapがnullの場合 🔵

**信頼性**: 🔵 *既存実装の `watchEffect` パターンより*

```typescript
// map.value が null かつ isLoaded.value が false の場合
// → watchEffect 内の早期リターンにより何もしない
if (!isLoaded.value || !map.value) return
```

### 4.4 エッジケース: GSIタイルサーバー応答なし 🟡

**信頼性**: 🟡 *EDGE-002から妥当な推測*

- GSIタイルサーバーが応答しない場合、MapLibre GL JSのデフォルトエラー処理が適用
- 他のレイヤー（避難場所・背景地図）への影響なし
- composable側での特別なエラーハンドリングは不要（MapLibre内蔵の再試行・タイルエラー処理に委任）

### 4.5 エッジケース: watchEffectの再実行 🟡

**信頼性**: 🟡 *Vue 3 watchEffect仕様から妥当な推測*

- `watchEffect` はリアクティブ依存が変化するたびに再実行される
- `isLoaded` と `map.value` が依存となるため、これらの値が変化した場合に再実行の可能性がある
- 既存実装では重複追加防止の処理が明示的に実装されていない
- マップインスタンスが生存期間中に再作成されないことを前提としている（`MapContainer` の `onUnmounted` でマップ破棄）

**参照したEARS要件**: REQ-020, REQ-021, EDGE-002  
**参照した設計文書**: architecture.md - provide/injectパターン, config/map.ts

---

## 5. 既存実装との差異分析

### 5.1 設計文書（TASK-0007.md）vs 既存実装

| 項目 | 設計文書の想定 | 既存実装（04_advanced_with_cc-sdd） | 本要件定義の採用 |
|------|-------------|-----------------------------------|----------------|
| マップロード検知 | `map.value?.on('load', ...)` | `watchEffect` + `isLoaded` Ref | 既存実装（`watchEffect`） |
| 引数 | `map: Ref<MaplibreMap \| null>` | `map: Readonly<Ref<MapInstance \| null>>`, `isLoaded: Readonly<Ref<boolean>>` | 既存実装（2引数） |
| マップ型 | `MaplibreMap`（maplibre-gl直接） | `MapInstance`（独自最小インターフェース） | 既存実装（`MapInstance`） |
| レイヤー定数インポート | `~/types` の `HAZARD_LAYER_DEFINITIONS` | `~/config/map` の `HAZARD_LAYERS` | 既存実装（`~/config/map`） |
| 定数名 | `HAZARD_LAYER_DEFINITIONS` | `HAZARD_LAYERS` | 既存実装（`HAZARD_LAYERS`） |
| 定数の構造 | `{ id, label, tileUrl }` | `{ sourceId, layerId, tileUrl, label, opacity }` | 既存実装（より詳細） |
| OpacityControlプロパティ | `overLayers` | `baseLayers` | 既存実装（`baseLayers`） |
| ソース追加 | composable内で `map.addSource` | composable内では未実装（mapスタイルで設定済み想定） | 要確認（後述） |
| export形式 | `export function` | `export const` (arrow function) | 既存実装（`export const`） |

### 5.2 既存実装の注意点 🟡

**信頼性**: 🟡 *既存実装の分析から妥当な推測*

既存実装の `useHazardLayers.ts` では `map.addSource` と `map.addLayer` が呼び出されていない。これは以下の可能性がある:

1. **マップスタイル設定でソース・レイヤーが事前定義されている**（`useMap` composable側で追加済み）
2. **実装が未完了**（OpacityControlの追加のみ実装済みで、ソース・レイヤー追加は別途必要）

本要件定義では、TASK-0007の完了条件「6種のハザードレイヤーが追加される」を満たすため、**ソース・レイヤー追加をcomposable内で行う**ことを要件とする。

**参照したEARS要件**: REQ-020, REQ-021  
**参照した設計文書**: config/map.ts - `HAZARD_LAYERS`, types/map.ts - `HazardLayerConfig`

---

## 6. 6種ハザードレイヤーの定義一覧 🔵

**信頼性**: 🔵 *config/map.ts `HAZARD_LAYERS` より確認済み*

| # | sourceId | layerId | tileUrl | label | opacity |
|---|----------|---------|---------|-------|---------|
| 1 | `hazard_flood` | `hazard_flood-layer` | `https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png` | 洪水浸水想定区域 | 0.7 |
| 2 | `hazard_hightide` | `hazard_hightide-layer` | `https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png` | 高潮浸水想定区域 | 0.7 |
| 3 | `hazard_tsunami` | `hazard_tsunami-layer` | `https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png` | 津波浸水想定 | 0.7 |
| 4 | `hazard_doseki` | `hazard_doseki-layer` | `https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki_data/{z}/{x}/{y}.png` | 土石流警戒区域 | 0.7 |
| 5 | `hazard_kyukeisha` | `hazard_kyukeisha-layer` | `https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki_data/{z}/{x}/{y}.png` | 急傾斜地警戒区域 | 0.7 |
| 6 | `hazard_jisuberi` | `hazard_jisuberi-layer` | `https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki_data/{z}/{x}/{y}.png` | 地滑り警戒区域 | 0.7 |

> **注意**: タイルURLのパスが設計文書（interfaces.ts）と既存実装（config/map.ts）で一部異なる。既存実装の `config/map.ts` のURLを正とする。

---

## 7. EARS要件・設計文書との対応関係

### 参照したユーザストーリー
- 防災マップユーザーとして、ハザードマップを重ね合わせ表示したい

### 参照した機能要件
- **REQ-020**: ハザードマップレイヤーcomposable（6種のGSIタイル追加、OpacityControl使用、デフォルト非表示、loadイベント後追加）
- **REQ-021**: ハザードマップの不透明度制御（OpacityControl左上配置、全レイヤー1コントロール集約）

### 参照した非機能要件
- **NFR-001**: WebGLレンダリングパフォーマンス維持
- **NFR-401**: GSI著作権表示の適切な表示

### 参照したEdgeケース
- **EDGE-002**: 外部タイルサーバー応答なし時のフォールバック
- **EDGE-201**: MapLibre GL JSインポートのブラウザ環境限定

### 参照した受け入れ基準
- `composables/useHazardLayers.ts` が作成されている
- 6種のハザードレイヤーが追加される（デフォルト `visibility: 'none'`）
- OpacityControl が左上（`position: 'top-left'`）に追加される
- マップのload完了後にレイヤーが追加される
- TypeScript strict モードでエラーなし

### 参照した設計文書
- **アーキテクチャ**: architecture.md - Composables表, provide/injectパターン, SSR禁止制約
- **型定義（設計）**: interfaces.ts - `HazardLayerDefinition`, `HAZARD_LAYER_DEFINITIONS`
- **型定義（既存実装）**: types/map.ts - `HazardLayerConfig`, `MapInstance`
- **設定定数（既存実装）**: config/map.ts - `HAZARD_LAYERS`
- **既存実装**: composables/useHazardLayers.ts（04_advanced_with_cc-sdd）

---

## 信頼性レベルサマリー

| 信頼性 | 件数 | 割合 | 該当項目 |
|--------|------|------|---------|
| 🔵 確実 | 18件 | 82% | 機能概要、入出力仕様、型制約、レイヤー定義、法的制約、基本使用パターン |
| 🟡 推測 | 4件 | 18% | パフォーマンス制約、GSIサーバーエラー時動作、watchEffect再実行、既存実装のソース追加欠如分析 |
| 🔴 根拠なし | 0件 | 0% | なし |

---

**作成者**: Claude Code  
**作成日時**: 2026-04-21
