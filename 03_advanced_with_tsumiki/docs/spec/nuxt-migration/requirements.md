# Nuxt 3 移行 要件定義書

## 概要

既存の防災マップPWA（Vanilla JavaScript SPA）をNuxt 3 + Vue 3 Composition APIに移行する。
現行の機能（インタラクティブマップ・ハザードマップ・避難場所・位置情報ルート・3D地形・PWA）をそのまま移植しつつ、
コードをcomposables単位に分割し保守性を向上させる。
SSRは無効（CSRのみ）とし、MapLibre GL JSのSSR問題を回避する。
移行時に既知のバグ（EDGE-101）とXSSリスクも同時修正する。

## 関連文書

- **ヒアリング記録**: [💬 interview-record.md](interview-record.md)
- **ユーザストーリー**: [📖 user-stories.md](user-stories.md)
- **受け入れ基準**: [✅ acceptance-criteria.md](acceptance-criteria.md)
- **コンテキストノート**: [📝 note.md](note.md)
- **準備タスク**: [🔧 prep.md](prep.md)
- **移行元要件定義書**: [docs/spec/disaster-prevention-map/requirements.md](../disaster-prevention-map/requirements.md)
- **移行元アーキテクチャ**: [docs/design/disaster-prevention-map/architecture.md](../../design/disaster-prevention-map/architecture.md)
- **型定義（参照）**: [docs/design/disaster-prevention-map/interfaces.ts](../../design/disaster-prevention-map/interfaces.ts)

---

## 機能要件（EARS記法）

**【信頼性レベル凡例】**:
- 🔵 **青信号**: PRD・EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実な要件
- 🟡 **黄信号**: PRD・EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測による要件
- 🔴 **赤信号**: PRD・EARS要件定義書・設計文書・ユーザヒアリングにない推測による要件

---

### プロジェクト構成・設定

#### REQ-001: Nuxt 3プロジェクトの初期化

システムはNuxt 3フレームワークを使用したプロジェクトとして構成されなければならない。 🔵 *ユーザーヒアリングより*

**詳細**:
- `nuxt.config.ts` にてSSRを無効化（`ssr: false`）
- TypeScriptを有効化（Nuxt 3標準）
- `<script setup lang="ts">` 形式でコンポーネントを記述

#### REQ-002: CSRモードの強制

システムはサーバーサイドレンダリングを行わず、クライアントサイドレンダリングのみで動作しなければならない。 🔵 *ユーザーヒアリングより*

**詳細**:
- `nuxt.config.ts`: `ssr: false`
- MapLibre GL JSのウィンドウ・DOM依存コードがSSR環境で実行されないことを保証

#### REQ-003: TypeScriptの全面採用

システムはTypeScriptで記述されなければならない。 🔵 *ユーザーヒアリングより*

**詳細**:
- 既存の `docs/design/disaster-prevention-map/interfaces.ts` を `types/` 以下に移動・整備
- `SkhbProperties`, `HazardLayerId`, `SkhbLayerId`, `UserLocation` 等の型を活用

---

### マップ初期化（useMap）

#### REQ-010: マップの初期化composable

システムはMapLibre GL JSのマップ初期化ロジックを `useMap` composableとして提供しなければならない。 🔵 *既存実装 main.js:15-32 + ユーザーヒアリングより*

**詳細**:
- `useMap(containerId: string)` を返す
- 初期設定: center `[138, 37]`, zoom `5`, minZoom `5`, maxZoom `18`
- maxBounds `[122, 20, 154, 50]`（日本国内に制限）
- `MapRef` として `Ref<maplibregl.Map | null>` を返す
- マップインスタンスの生成・破棄を管理（`onMounted` / `onUnmounted`）

#### REQ-011: マップコンテナのVueコンポーネント化

システムはマップ表示領域を `<MapContainer>` Vueコンポーネントとして提供しなければならない。 🔵 *ユーザーヒアリング（composables切り出し要件）より*

**詳細**:
- `components/MapContainer.vue` を作成
- `<div id="map">` を内包し、`height: 100vh` のスタイルを適用
- `useMap` composableを内部で呼び出す

---

### ハザードマップレイヤー（useHazardLayers）

#### REQ-020: ハザードマップレイヤーcomposable

システムは6種ハザードマップのレイヤー追加・制御ロジックを `useHazardLayers` composableとして提供しなければならない。 🔵 *既存実装 main.js:35-100, 133-174 + ユーザーヒアリングより*

**詳細**:
- `useHazardLayers(map: Ref<maplibregl.Map | null>)` を提供
- 6種のハザードマップ（洪水・高潮・津波・土石流・急傾斜地・地滑り）をGSIタイルから追加
- `maplibre-gl-opacity` の `OpacityControl` をそのまま使用して表示制御UI追加
- 各レイヤーのデフォルト: `visibility: 'none'`
- map の `load` イベント後にレイヤーを追加

#### REQ-021: ハザードマップの不透明度制御

システムはハザードマップのレイヤーごとの表示/非表示と不透明度をユーザーが制御できなければならない。 🔵 *既存実装 main.js:430-440 + 既存要件定義 REQ-007より*

**詳細**:
- `OpacityControl` を左上（`position: 'top-left'`）に配置
- 全ハザードレイヤーをひとつのコントロールに集約

---

### 避難場所レイヤー（useShelterLayers）

#### REQ-030: 避難場所レイヤーcomposable

システムは8種避難場所レイヤーの追加・フィルタリング制御ロジックを `useShelterLayers` composableとして提供しなければならない。 🔵 *既存実装 main.js:102-115, 187-363 + ユーザーヒアリングより*

**詳細**:
- `useShelterLayers(map: Ref<maplibregl.Map | null>)` を提供
- ベクトルタイルソース `skhb`（`/skhb/{z}/{x}/{y}.pbf`）を追加
- 8種の `skhb-N-layer` を定義（disaster1〜8 に対応）
- `maplibre-gl-opacity` の `OpacityControl` を右上（`position: 'top-right'`）に配置
- 排他制御（1種類のみ同時表示）
- ズームレベル5〜8に対応

#### REQ-031: 現在表示中の避難場所フィルターの提供

システムは現在表示中の避難場所レイヤーのフィルター式を返す関数を `useShelterLayers` composable内に提供しなければならない。 🔵 *既存実装 main.js:371-382より*

**詳細**:
- `getCurrentLayerFilter()` 関数として提供
- 表示中レイヤー（`visibility: 'visible'`）のfilter式を返す

---

### 位置情報（useGeolocation）

#### REQ-040: 位置情報追跡composable

システムはブラウザのGeolocation APIによる現在地追跡ロジックを `useGeolocation` composableとして提供しなければならない。 🔵 *既存実装 main.js:418-425 + ユーザーヒアリングより*

**詳細**:
- `useGeolocation(map: Ref<maplibregl.Map | null>)` を提供
- `GeolocateControl` を初期化（`trackUserLocation: true`, `fitBoundsOptions: {zoom: 14}`）
- `userLocation: Ref<UserLocation>` を返す（`[lng, lat] | null`）
- 追跡停止時に `userLocation = null` にリセット

---

### ルート描画（useRoute）

#### REQ-050: 最寄り避難場所ルートcomposable

システムは最寄り避難場所への直線ルート計算・描画ロジックを `useRoute` composableとして提供しなければならない。 🔵 *既存実装 main.js:387-413, 542-577 + ユーザーヒアリングより*

**詳細**:
- `useRoute(map: Ref<maplibregl.Map | null>, userLocation: Ref<UserLocation>, getCurrentLayerFilter: () => FilterExpression)` を提供
- `@turf/distance` を使用して最近傍施設を計算（`getNearestFeature` 関数）
- `route-layer` をLineString（`#33aaff`、幅4px）で描画
- map の `render` イベントで毎フレーム更新

#### REQ-051: ズームレベルによるルート表示制御

ズームレベルが7以上かつ現在地が取得されている場合に限り、最寄り避難場所への直線ルートを表示しなければならない。 🔵 *既存実装 main.js:548-554 + 既存要件定義 REQ-101より*

**詳細**:
- ズーム < 7 または `userLocation === null` の場合はルートデータをクリア

#### REQ-052: EDGE-101バグの修正（null安全なルート計算）

`getNearestFeature()` が `null` を返した場合にルート計算処理がクラッシュしないよう、null チェックを実施しなければならない。 🔵 *ユーザーヒアリング + 既存バグリポート（docs/README.md）より*

**詳細**:
```typescript
const nearestFeature = getNearestFeature(lng, lat)
if (!nearestFeature) return  // ← null チェック追加
```

---

### 避難場所ポップアップ（コンポーネント化）

#### REQ-060: ポップアップのVueコンポーネント化

システムは避難場所クリック時のポップアップ表示を、XSSを排除したVue 3コンポーネントとして実装しなければならない。 🔵 *ユーザーヒアリング（XSS修正要件）より*

**詳細**:
- MapLibre GL JSの `Popup` に `setHTML` で文字列を渡す既存実装を変更
- Vueの `teleport` またはPopup内にVueコンポーネントをマウントする方式に変更
- 施設名・住所・備考・対応災害種別の表示は Vue テンプレート（`{{ }}`）で安全にバインド
- `SkhbProperties` 型を活用

#### REQ-061: 避難場所ホバー時のカーソル変更

ユーザーが避難場所アイコン上にマウスカーソルを移動した場合、カーソルをポインター形状に変更しなければならない。 🔵 *既存実装 main.js:519-540 + 既存要件定義 REQ-103より*

---

### 3D地形（useTerrain）

#### REQ-070: 地形可視化composable

システムはGSI標高タイルを使用した3D地形・陰影図の追加ロジックを `useTerrain` composableとして提供しなければならない。 🔵 *既存実装 main.js:580-602 + ユーザーヒアリングより*

**詳細**:
- `useTerrain(map: Ref<maplibregl.Map | null>)` を提供
- `maplibre-gl-gsi-terrain` の `useGsiTerrainSource` でソース追加
- `hillshade` レイヤーを追加（`hillshade-exaggeration: 0.2`）
- `TerrainControl` を追加

---

### PWA

#### REQ-080: @vite-pwa/nuxtによるPWA対応

システムはNuxt 3の `@vite-pwa/nuxt` モジュールを使用してPWA機能を実装しなければならない。 🔵 *ユーザーヒアリングより*

**詳細**:
- `nuxt.config.ts` に `@vite-pwa/nuxt` を追加
- アプリ名: 防災マップ
- display: standalone
- 既存アイコン（192, 256, 384, 512px）を維持
- Service Worker のキャッシュ戦略を適切に設定（最低限: ネットワークファースト）

---

### テスト

#### REQ-090: テスト基盤の整備

システムはVitestによる単体テストとPlaywrightによるE2Eテストが実行できる環境を持たなければならない。 🔵 *ユーザーヒアリングより*

**詳細**:
- `@nuxt/test-utils` + `vitest` の設定
- composables（`getNearestFeature` 等）の単体テスト
- 既存の `docs/spec/disaster-prevention-map/tests/` のテストコードを移行・修正

---

## 非機能要件

### パフォーマンス

- NFR-001: システムはクライアントサイドレンダリングのみで動作し、MapLibre GL JSのWebGLレンダリングのパフォーマンスを維持しなければならない。 🔵 *既存実装 + ユーザーヒアリングより*
- NFR-002: システムはNuxt 3のcomposablesのリアクティブシステムにより、毎フレームのルート計算を軽量に保たなければならない。 🟡 *既存実装 NFR-002から妥当な推測*

### セキュリティ

- NFR-101: システムはポップアップ表示においてVue 3のテンプレートバインディング（`{{ }}`）を使用し、XSSリスクを排除しなければならない。 🔵 *ユーザーヒアリングより*
- NFR-102: システムはユーザーの位置情報をサーバー側に送信・保存しないこと（クライアントメモリのみで管理）。 🔵 *既存要件定義 NFR-102より*

### ユーザビリティ

- NFR-201: システムはスマートフォンからも利用可能なモバイルフレンドリーなUIを提供しなければならない。 🔵 *既存要件定義 NFR-201より*
- NFR-202: システムは地図をブラウザの表示領域全体に表示しなければならない。 🔵 *既存要件定義 NFR-202より*

### 運用性

- NFR-301: システムは `@vite-pwa/nuxt` によりPWAとして動作し、一部機能をオフライン環境でも利用可能にしなければならない。 🔵 *ユーザーヒアリングより*

### 法的要件

- NFR-401: システムは使用している地理データの著作権表示（OpenStreetMap、国土地理院）を適切に表示しなければならない。 🔵 *既存要件定義 NFR-401より*

---

## Edgeケース

### エラー処理

- EDGE-001: 位置情報取得失敗時（権限拒否・GPS不取得）はルート表示を無効化し、他機能は正常動作を維持しなければならない。 🔵 *既存要件定義 EDGE-001より*
- EDGE-002: 外部タイルサーバー（GSI）が応答しない場合、MapLibreのデフォルトエラー処理が適用され、他レイヤーへの影響を最小化しなければならない。 🟡 *既存要件定義 EDGE-002から妥当な推測*

### 境界値

- EDGE-101: 表示中の避難場所レイヤーにフィーチャーが0件の場合、ルート計算がエラーにならないようnullチェックを実施しなければならない。 🔵 *ユーザーヒアリング + 既存バグリポートより*
- EDGE-102: 複数避難場所が近接している場合、最初に検出された地物のみをポップアップ表示する。 🔵 *既存要件定義 EDGE-102より*

### Nuxt 3固有

- EDGE-201: MapLibre GL JSのインポートはブラウザ環境でのみ実行されなければならない（`onMounted` または `<ClientOnly>` を使用）。 🔵 *SSR無効設定と技術制約から確実な要件*
- EDGE-202: `useMap` composableはVueコンポーネントのライフサイクル（`onMounted`/`onUnmounted`）内で呼ばれなければならない。マップインスタンスのメモリリークを防ぐため `onUnmounted` で `map.remove()` を呼ぶ。 🔵 *Vue 3 composablesのベストプラクティスより*

---

## 移行対象の機能一覧

| 機能 | 移行元 | 移行先 | 状態変更 |
|------|--------|--------|---------|
| マップ初期化 | main.js:15-32 | `useMap` composable | — |
| ハザードマップ | main.js:35-174 | `useHazardLayers` composable | — |
| 避難場所レイヤー | main.js:102-363 | `useShelterLayers` composable | — |
| 位置情報追跡 | main.js:418-425 | `useGeolocation` composable | — |
| 最近傍ルート | main.js:371-577 | `useRoute` composable | バグ修正(EDGE-101) |
| ポップアップ | main.js:458-516 | Vueコンポーネント | XSS修正 |
| カーソル変更 | main.js:519-540 | `useRoute` or `useShelterLayers` | — |
| 3D地形 | main.js:580-602 | `useTerrain` composable | — |
| PWA | sw.js + manifest.json | @vite-pwa/nuxt | 改善 |
