# nuxt-migration ユーザストーリー

**作成日**: 2026-04-20
**関連要件定義**: [requirements.md](requirements.md)
**ヒアリング記録**: [interview-record.md](interview-record.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: PRD・EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実なストーリー
- 🟡 **黄信号**: PRD・EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測によるストーリー
- 🔴 **赤信号**: PRD・EARS要件定義書・設計文書・ユーザヒアリングにない推測によるストーリー

---

## エピック1: プロジェクト基盤構築

### ストーリー 1.1: Nuxt 3プロジェクトの初期化 🔵

**信頼性**: 🔵 *ユーザーヒアリング + Nuxt 3技術要件より*

**私は** 開発者 **として**
**Nuxt 3 + TypeScript + CSRモードのプロジェクトを初期化したい**
**そうすることで** 既存のVanilla JS SPAの機能をVue 3 Composition APIで移植できる

**関連要件**: REQ-001, REQ-002, REQ-003

**詳細シナリオ**:
1. `npx nuxi@latest init` でNuxt 3プロジェクトを作成
2. `nuxt.config.ts` に `ssr: false` を設定
3. TypeScriptの設定を確認（Nuxt 3はデフォルトでTypeScript対応）
4. 既存の `interfaces.ts` を `types/` ディレクトリに移動・整備
5. 既存の `public/skhb/` ベクトルタイルを `public/` 以下にコピー

**前提条件**:
- Node.js 18以上がインストールされている
- 既存の `03_advanced_with_tsumiki/` の内容が参照できる

**優先度**: Must Have

---

### ストーリー 1.2: 依存パッケージの移行 🔵

**信頼性**: 🔵 *既存 package.json + ユーザーヒアリングより*

**私は** 開発者 **として**
**既存のnpmパッケージをNuxt 3プロジェクトに導入したい**
**そうすることで** 既存ライブラリ（MapLibre・Turf・maplibre-gl-opacity等）をそのまま活用できる

**関連要件**: REQ-001, REQ-080

**詳細シナリオ**:
1. `maplibre-gl`, `@turf/distance`, `maplibre-gl-opacity`, `maplibre-gl-gsi-terrain` をインストール
2. `@vite-pwa/nuxt` をNuxtモジュールとしてインストール・設定
3. `@nuxt/test-utils`, `vitest`, `@playwright/test` をdevDependenciesに追加
4. `nuxt.config.ts` でモジュール設定を完了

**優先度**: Must Have

---

## エピック2: composables実装

### ストーリー 2.1: マップ初期化composable 🔵

**信頼性**: 🔵 *既存実装 main.js:15-32 + ユーザーヒアリングより*

**私は** 開発者 **として**
**MapLibre GL JSのマップ初期化ロジックを `useMap` composableとして実装したい**
**そうすることで** 各Vueコンポーネントでマップインスタンスを再利用でき、ライフサイクル管理が一元化される

**関連要件**: REQ-010, REQ-011, EDGE-202

**詳細シナリオ**:
1. `composables/useMap.ts` を作成
2. `onMounted` 内でマップを初期化（center, zoom, minZoom, maxBounds）
3. `onUnmounted` で `map.remove()` を呼び、メモリリークを防ぐ
4. `Ref<maplibregl.Map | null>` を返す
5. `MapContainer.vue` コンポーネントから `useMap` を呼び出す

**前提条件**:
- SSR無効（`ssr: false`）が設定済み

**制約事項**:
- `maplibregl` のimportはブラウザ環境（`onMounted`内）でのみ実行

**優先度**: Must Have

---

### ストーリー 2.2: ハザードマップレイヤーcomposable 🔵

**信頼性**: 🔵 *既存実装 main.js:35-174 + ユーザーヒアリングより*

**私は** 開発者 **として**
**6種ハザードマップのレイヤー管理ロジックを `useHazardLayers` composableとして実装したい**
**そうすることで** ハザードマップの追加・制御ロジックが独立したモジュールとして管理できる

**関連要件**: REQ-020, REQ-021

**詳細シナリオ**:
1. `composables/useHazardLayers.ts` を作成
2. 6種ハザードマップのRasterTileSourceを定義
3. 各ハザードレイヤーをデフォルト非表示で追加
4. `maplibre-gl-opacity` の `OpacityControl` を左上に追加
5. `map.on('load')` イベント内で実行

**優先度**: Must Have

---

### ストーリー 2.3: 避難場所レイヤーcomposable 🔵

**信頼性**: 🔵 *既存実装 main.js:102-363 + ユーザーヒアリングより*

**私は** 開発者 **として**
**8種避難場所レイヤーのフィルタリング制御ロジックを `useShelterLayers` composableとして実装したい**
**そうすることで** 災害種別ごとの避難場所表示・排他制御が独立したモジュールで管理できる

**関連要件**: REQ-030, REQ-031

**詳細シナリオ**:
1. `composables/useShelterLayers.ts` を作成
2. `skhb` ベクトルタイルソースを追加（`/skhb/{z}/{x}/{y}.pbf`）
3. 8種の `skhb-N-layer` をfilter式付きで定義・追加
4. `maplibre-gl-opacity` の `OpacityControl`（baseLayers: ラジオボタン）を右上に追加
5. `getCurrentLayerFilter()` 関数を返す

**優先度**: Must Have

---

### ストーリー 2.4: 位置情報composable 🔵

**信頼性**: 🔵 *既存実装 main.js:418-425 + ユーザーヒアリングより*

**私は** 開発者 **として**
**GeolocationControlの初期化と現在地追跡ロジックを `useGeolocation` composableとして実装したい**
**そうすることで** ユーザーの現在地がVueのリアクティブシステムで管理され、他のcomposablesから参照できる

**関連要件**: REQ-040

**詳細シナリオ**:
1. `composables/useGeolocation.ts` を作成
2. `GeolocateControl` を初期化（`trackUserLocation: true`）
3. `geolocate` イベントで `userLocation` を更新
4. 追跡停止イベントで `userLocation = null` にリセット
5. `Ref<UserLocation>` を返す

**優先度**: Must Have

---

### ストーリー 2.5: ルート描画composable（バグ修正含む） 🔵

**信頼性**: 🔵 *既存実装 main.js:371-577 + ユーザーヒアリング（EDGE-101修正）より*

**私は** 開発者 **として**
**最寄り避難場所への直線ルート計算・描画ロジックを `useRoute` composableとして実装したい**
**そうすることで** ルート描画の責務が独立し、EDGE-101バグも同時に解消される

**関連要件**: REQ-050, REQ-051, REQ-052

**詳細シナリオ**:
1. `composables/useRoute.ts` を作成
2. `getNearestFeature(lng, lat, filter)` 関数を実装（Turf.js活用）
3. **EDGE-101修正**: `getNearestFeature()` が `null` を返す場合のnullチェックを追加
4. `map.on('render')` で毎フレームルートを更新
5. ズーム < 7 または現在地なしの場合はルートデータをクリア

**優先度**: Must Have

---

### ストーリー 2.6: 3D地形composable 🔵

**信頼性**: 🔵 *既存実装 main.js:580-602 + ユーザーヒアリングより*

**私は** 開発者 **として**
**GSI標高タイルを使用した3D地形・陰影図の設定ロジックを `useTerrain` composableとして実装したい**
**そうすることで** 地形可視化の責務が独立したモジュールで管理できる

**関連要件**: REQ-070

**詳細シナリオ**:
1. `composables/useTerrain.ts` を作成
2. `maplibre-gl-gsi-terrain` の `useGsiTerrainSource` でRasterDEMソースを追加
3. `hillshade` レイヤーを追加（`exaggeration: 0.2`）
4. `TerrainControl` をマップに追加

**優先度**: Must Have

---

## エピック3: XSS修正・ポップアップコンポーネント化

### ストーリー 3.1: 避難場所ポップアップのVueコンポーネント化（XSS修正） 🔵

**信頼性**: 🔵 *ユーザーヒアリング（XSS修正要件）より*

**私は** 開発者 **として**
**避難場所クリック時のポップアップをVue 3コンポーネントとして実装したい**
**そうすることで** setHTMLによるXSSリスクを排除し、型安全なポップアップ表示ができる**

**関連要件**: REQ-060, NFR-101

**詳細シナリオ**:
1. `components/ShelterPopup.vue` を作成
2. `SkhbProperties` 型のpropsを受け取る
3. 施設名・住所・備考・対応災害種別を `{{ }}` バインディングで表示
4. 対応済み災害を通常表示、未対応をグレーアウト（class binding使用）
5. MapLibre GL JSの `Popup` と組み合わせる（`setDOMContent` を使用）

**前提条件**:
- `useShelterLayers` composableが実装済み

**優先度**: Must Have

---

## エピック4: PWAとテスト

### ストーリー 4.1: @vite-pwa/nuxtによるPWA実装 🔵

**信頼性**: 🔵 *ユーザーヒアリングより*

**私は** 開発者 **として**
**`@vite-pwa/nuxt` を使用してPWA機能を設定したい**
**そうすることで** 既存の手動SW実装より信頼性の高いService Workerとマニフェストが自動生成される**

**関連要件**: REQ-080, NFR-301

**詳細シナリオ**:
1. `@vite-pwa/nuxt` をインストール
2. `nuxt.config.ts` でPWA設定（name, icons, display: standalone）
3. キャッシュ戦略を設定（最低限: NetworkFirst）
4. 既存アイコン（192, 256, 384, 512px）を `public/` に配置

**優先度**: Must Have

---

### ストーリー 4.2: テスト基盤の整備 🔵

**信頼性**: 🔵 *ユーザーヒアリングより*

**私は** 開発者 **として**
**VitestとPlaywrightのテスト環境をセットアップしたい**
**そうすることで** 移行後もcomposablesの動作を自動テストで保証できる**

**関連要件**: REQ-090

**詳細シナリオ**:
1. `@nuxt/test-utils` + `vitest` を設定
2. `tests/unit/` に composables のユニットテストを配置
3. `getNearestFeature()` のユニットテスト（EDGE-101の修正検証を含む）
4. 既存の `docs/spec/disaster-prevention-map/tests/` を移行・修正
5. `playwright.config.ts` を設定し、E2Eテスト環境を整備

**優先度**: Must Have

---

## ストーリーマップ

```
エピック1: プロジェクト基盤構築
├── ストーリー 1.1 (🔵 Must Have) — Nuxt 3初期化
└── ストーリー 1.2 (🔵 Must Have) — 依存パッケージ移行

エピック2: composables実装
├── ストーリー 2.1 (🔵 Must Have) — useMap
├── ストーリー 2.2 (🔵 Must Have) — useHazardLayers
├── ストーリー 2.3 (🔵 Must Have) — useShelterLayers
├── ストーリー 2.4 (🔵 Must Have) — useGeolocation
├── ストーリー 2.5 (🔵 Must Have) — useRoute（EDGE-101修正含む）
└── ストーリー 2.6 (🔵 Must Have) — useTerrain

エピック3: XSS修正・ポップアップコンポーネント化
└── ストーリー 3.1 (🔵 Must Have) — ShelterPopup.vue（XSS修正）

エピック4: PWAとテスト
├── ストーリー 4.1 (🔵 Must Have) — @vite-pwa/nuxt
└── ストーリー 4.2 (🔵 Must Have) — Vitest + Playwright
```

---

## 信頼性レベルサマリー

- 🔵 青信号: 11件 (100%)
- 🟡 黄信号: 0件 (0%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: 高品質（ヒアリングにより全ストーリーが確実な根拠を持つ）
