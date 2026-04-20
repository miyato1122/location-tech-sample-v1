# Implementation Plan

- [ ] 1. Foundation: Nuxt プロジェクト初期設定
- [ ] 1.1 プロジェクト構成とパッケージ設定
  - `nuxt-map-app/` ディレクトリを作成し、Nuxt 3・TypeScript・maplibre-gl・maplibre-gl-opacity・@turf/distance・maplibre-gl-gsi-terrain・@vite-pwa/nuxt を依存パッケージとして追加する
  - `nuxt.config.ts` の骨格（@vite-pwa/nuxt モジュール登録・SSR 設定の準備）、`tsconfig.json`（strict: true）、`app.vue`（ルートコンポーネント）を作成する
  - グローバルスタイル（`assets/styles/main.css` に maplibre-gl.css のインポートを含む）を作成し、`app.vue` から参照する
  - `npm run dev` でエラーなくアプリが起動する
  - _Requirements: 1.1_

- [ ] 1.2 TypeScript 型定義とモジュールシム設定
  - ドメイン型（Coordinate・DisasterKey・ShelterProperties・HazardLayerConfig・ShelterLayerConfig・LayerVisibility・MapInitOptions・RouteLineStyle・HillshadeConfig・TerrainConfig・ShelterVisibleFilter）を定義する
  - `maplibre-gl-opacity`・`maplibre-gl-gsi-terrain` の `declare module` シムと、GeolocateControl の内部プロパティ `_watchState: 'OFF' | 'ACTIVE_LOCK' | 'BACKGROUND'` の型拡張を定義する
  - TypeScript のコンパイルエラーがゼロの状態で型ファイルが完成している
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 1.3 地図定数設定ファイルの作成
  - 初期座標・ズーム・表示範囲制限（MAP_INIT）、6 種ハザードレイヤー設定（HAZARD_LAYERS）、8 種避難場所レイヤー設定（SHELTER_LAYERS）、ルートラインスタイル（ROUTE_LINE）、陰影図設定（HILLSHADE_CONFIG）、地形設定（TERRAIN_CONFIG）を `as const` で定義する
  - SKHB タイル URL を `useRuntimeConfig().app.baseURL + 'skhb/{z}/{x}/{y}.pbf'` で構築する関数を定義し、サブパス配信に対応させる
  - 全定数が型定義に沿って正しく型付けされており、他ファイルから import できる
  - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.7, 4.6, 5.2, 5.4_

- [ ] 1.4 SKHB ベクトルタイルの配置
  - 既存の `public/skhb/` ディレクトリを `nuxt-map-app/public/skhb/` にコピーする
  - 開発サーバーで `/skhb/{z}/{x}/{y}.pbf` へのリクエストが 200 を返す
  - _Requirements: 3.1_

- [ ] 2. useMap コンポーザブル実装
  - `onMounted` 内で MapLibre Map インスタンスを生成し、OSM ラスタータイル・初期座標 [138, 37]・ズーム 5・ズーム範囲 5-18・日本域の表示範囲制限・ハザードソース/レイヤー・SKHB ソース/レイヤーを含む初期スタイルを適用する
  - `map.loaded()` のフォールバック付きで `map.on('load')` を登録し、`isLoaded: Ref<boolean>` を true に設定する
  - `initMap(container: HTMLElement)` と `destroyMap()` インターフェースを実装し、`onUnmounted` で Map インスタンスを破棄・`isLoaded` を false にリセットする
  - `map.on('error', ...)` でタイルエラーをコンソールに出力する
  - `initMap()` 呼び出し後に地図コンテナが DOM に描画され、`isLoaded` が true になる
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Core: 機能コンポーザブルと PWA 設定

- [ ] 3.1 (P) useHazardLayers コンポーザブル実装
  - `watchEffect` で `isLoaded` が true になるのを待ち、左上に OpacityControl を追加する（`baseLayers` に HAZARD_LAYERS の各 layerId を登録）
  - OpacityControl でレイヤーをオンにすると、対応するハザードラスタータイルが不透明度 0.7 で地図上に重なって表示される
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - _Boundary: useHazardLayers_

- [ ] 3.2 (P) useShelters コンポーザブル実装
  - `isLoaded` 後に右上 OpacityControl を追加し、マーカークリック時のポップアップ（施設名・住所・備考・対応災害種別を XSS エスケープ済み HTML で表示）とホバー時カーソル変更イベントを登録する
  - `getVisibleLayerFilter()` を実装し、表示中 skhb レイヤーの FilterSpecification または null を返す（`map.getStyle()` から都度取得）
  - 避難場所フィルターで災害種別を選択するとマーカーが表示され、クリックでポップアップが出る
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - _Boundary: useShelters_

- [ ] 3.3 (P) useTerrain コンポーザブル実装
  - `isLoaded` 後に `useGsiTerrainSource` で地理院標高タイルを raster-dem ソースとして追加し、陰影図レイヤー（exaggeration 0.2）を `hazard_jisuberi-layer` の手前に挿入する
  - TerrainControl を地図に追加し（標高倍率 1 倍）、ユーザーが 3D 地形表示を ON/OFF できる
  - TerrainControl をオンにすると地形が立体的に描画される
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - _Boundary: useTerrain_

- [ ] 3.4 (P) PWA Workbox キャッシュ設定
  - `nuxt.config.ts` の `pwa.workbox.runtimeCaching` に 3 つのキャッシュルールを定義する（ローカル SKHB タイル `/skhb/**`: CacheFirst・外部タイル OSM/ハザード/地理院: NetworkFirst・アプリシェル: デフォルト CacheFirst）
  - `pwa.manifest` でアプリ名・アイコン・theme_color を設定し、`useHead()` で viewport meta タグを設定する
  - ビルド後に Service Worker が自動生成され、`/manifest.json` が 200 を返す
  - _Requirements: 6.1, 6.2, 6.3_
  - _Boundary: nuxt.config.ts_

- [ ] 4. useGeolocation コンポーザブル実装
  - `isLoaded` 後に GeolocateControl を右下に追加し、空 FeatureCollection の route GeoJSON ソースと青色・線幅 4px のルートラインレイヤーを地図に追加する
  - `geolocate` イベントで `userLocation: Ref<Coordinate | null>` を更新し、`map.on('render')` ハンドラーで `_watchState === 'OFF'` の場合は `userLocation` をリセットする
  - zoom >= 7 かつ `userLocation` が非 null の場合は `getVisibleLayerFilter()` を呼び出し、Turf.js で最寄り避難場所を特定して route source の LineString を更新する。条件を満たさない場合は route source に空 FeatureCollection をセットする
  - GeolocateControl を有効化して現在地を取得すると、最寄りの表示中避難場所まで青いルートラインが描画される
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - _Depends: 3.2_

- [ ] 5. pages/index.vue 統合
  - `definePageMeta({ ssr: false })` を設定し、マップコンテナ要素の template ref を `onMounted` で `initMap()` に渡す
  - 初期化順序（useMap → useHazardLayers → useShelters → useGeolocation → useTerrain）でコンポーザブルを呼び出し、`onUnmounted` で `destroyMap()` を呼び出す
  - 地図コンテナに `height: 100vh` のフルスクリーン CSS を適用する
  - ページを開くと地図が表示され、ハザードオーバーレイ・避難場所フィルター・GPS ルート・3D 地形の全機能が動作する
  - _Requirements: 1.1, 1.3, 6.4_
  - _Depends: 2, 3.1, 3.2, 3.3, 3.4, 4_

- [ ] 6. Validation: テスト
- [ ]* 6.1 ユニットテスト実装
  - HAZARD_LAYERS 6 件・SHELTER_LAYERS 8 件・MAP_INIT 値の正確性を検証するテストを作成する
  - モック Map インスタンスで `getVisibleLayerFilter()` の visibility 変化（フィルター返却・null 返却）を検証する
  - 複数地物の座標配列を与えて最寄り地物選択が正しいことを Turf.js 実ライブラリで検証する
  - 全テストが pass する
  - _Requirements: 2.1, 3.1, 3.2, 4.3_

- [ ]* 6.2 E2E テスト実装（Playwright）
  - ページロード → 地図コンテナが表示される
  - ハザードレイヤーパネルでレイヤーを選択 → オーバーレイが地図上に表示される
  - 避難場所フィルターで災害種別を選択 → マーカーが表示され、クリックでポップアップが出る
  - `/manifest.json` が 200 を返し、Service Worker が登録される
  - _Requirements: 2.3, 3.4, 3.5, 6.1, 6.2_
