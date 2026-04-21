# Implementation Plan

- [x] 1. Foundation: Nuxt プロジェクト�E期設宁E
- [x] 1.1 プロジェクト構�Eとパッケージ設宁E
  - `nuxt-map-app/` チE��レクトリを作�Eし、Nuxt 3・TypeScript・maplibre-gl・maplibre-gl-opacity・@turf/distance・maplibre-gl-gsi-terrain・@vite-pwa/nuxt を依存パチE��ージとして追加する
  - `nuxt.config.ts` の骨格�E�Evite-pwa/nuxt モジュール登録・SSR 設定�E準備�E�、`tsconfig.json`�E�Etrict: true�E�、`app.vue`�E�ルートコンポ�Eネント）を作�Eする
  - グローバルスタイル�E�Eassets/styles/main.css` に maplibre-gl.css のインポ�Eトを含む�E�を作�Eし、`app.vue` から参�Eする
  - `npm run dev` でエラーなくアプリが起動すめE
  - _Requirements: 1.1_

- [x] 1.2 TypeScript 型定義とモジュールシム設宁E
  - ドメイン型！Eoordinate・DisasterKey・ShelterProperties・HazardLayerConfig・ShelterLayerConfig・LayerVisibility・MapInitOptions・RouteLineStyle・HillshadeConfig・TerrainConfig・ShelterVisibleFilter�E�を定義する
  - `maplibre-gl-opacity`・`maplibre-gl-gsi-terrain` の `declare module` シムと、GeolocateControl の冁E��プロパティ `_watchState: 'OFF' | 'ACTIVE_LOCK' | 'BACKGROUND'` の型拡張を定義する
  - TypeScript のコンパイルエラーがゼロの状態で型ファイルが完�EしてぁE��
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 1.3 地図定数設定ファイルの作�E
  - 初期座標�Eズーム・表示篁E��制限！EAP_INIT�E�、E 種ハザードレイヤー設定！EAZARD_LAYERS�E�、E 種避難場所レイヤー設定！EHELTER_LAYERS�E�、ルートラインスタイル�E�EOUTE_LINE�E�、E��影図設定！EILLSHADE_CONFIG�E�、地形設定！EERRAIN_CONFIG�E�を `as const` で定義する
  - SKHB タイル URL めE`useRuntimeConfig().app.baseURL + 'skhb/{z}/{x}/{y}.pbf'` で構築する関数を定義し、サブパス配信に対応させる
  - 全定数が型定義に沿って正しく型付けされており、他ファイルから import できる
  - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.7, 4.6, 5.2, 5.4_

- [x] 1.4 SKHB ベクトルタイルの配置
  - 既存�E `public/skhb/` チE��レクトリめE`nuxt-map-app/public/skhb/` にコピ�Eする
  - 開発サーバ�Eで `/skhb/{z}/{x}/{y}.pbf` へのリクエストが 200 を返す
  - _Requirements: 3.1_

- [x] 2. useMap コンポ�Eザブル実裁E
  - `onMounted` 冁E�� MapLibre Map インスタンスを生成し、OSM ラスタータイル・初期座樁E[138, 37]・ズーム 5・ズーム篁E�� 5-18・日本域�E表示篁E��制限�Eハザードソース/レイヤー・SKHB ソース/レイヤーを含む初期スタイルを適用する
  - `map.loaded()` のフォールバック付きで `map.on('load')` を登録し、`isLoaded: Ref<boolean>` めEtrue に設定すめE
  - `initMap(container: HTMLElement)` と `destroyMap()` インターフェースを実裁E��、`onUnmounted` で Map インスタンスを破棁E�E`isLoaded` めEfalse にリセチE��する
  - `map.on('error', ...)` でタイルエラーをコンソールに出力すめE
  - `initMap()` 呼び出し後に地図コンチE��ぁEDOM に描画され、`isLoaded` ぁEtrue になめE
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Core: 機�Eコンポ�Eザブルと PWA 設宁E

- [x] 3.1 (P) useHazardLayers コンポ�Eザブル実裁E
  - `watchEffect` で `isLoaded` ぁEtrue になる�Eを征E��、左上に OpacityControl を追加する�E�EbaseLayers` に HAZARD_LAYERS の吁ElayerId を登録�E�E
  - OpacityControl でレイヤーをオンにすると、対応するハザードラスタータイルが不透�E度 0.7 で地図上に重なって表示されめE
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - _Boundary: useHazardLayers_

- [x] 3.2 (P) useShelters コンポ�Eザブル実裁E
  - `isLoaded` 後に右丁EOpacityControl を追加し、�EーカークリチE��時�EポップアチE�E�E�施設名�E住所・備老E�E対応災害種別めEXSS エスケープ済み HTML で表示�E�とホバー時カーソル変更イベントを登録する
  - `getVisibleLayerFilter()` を実裁E��、表示中 skhb レイヤーの FilterSpecification また�E null を返す�E�Emap.getStyle()` から都度取得！E
  - 避難場所フィルターで災害種別を選択するとマ�Eカーが表示され、クリチE��でポップアチE�Eが�EめE
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - _Boundary: useShelters_

- [x] 3.3 (P) useTerrain コンポ�Eザブル実裁E
  - `isLoaded` 後に `useGsiTerrainSource` で地琁E��標高タイルめEraster-dem ソースとして追加し、E��影図レイヤー�E�Exaggeration 0.2�E�を `hazard_jisuberi-layer` の手前に挿入する
  - TerrainControl を地図に追加し（標高倍率 1 倍）、ユーザーぁE3D 地形表示めEON/OFF できる
  - TerrainControl をオンにすると地形が立体的に描画されめE
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - _Boundary: useTerrain_

- [x] 3.4 (P) PWA Workbox キャチE��ュ設宁E
  - `nuxt.config.ts` の `pwa.workbox.runtimeCaching` に 3 つのキャチE��ュルールを定義する�E�ローカル SKHB タイル `/skhb/**`: CacheFirst・外部タイル OSM/ハザーチE地琁E��: NetworkFirst・アプリシェル: チE��ォルチECacheFirst�E�E
  - `pwa.manifest` でアプリ名�Eアイコン・theme_color を設定し、`useHead()` で viewport meta タグを設定すめE
  - ビルド後に Service Worker が�E動生成され、`/manifest.json` ぁE200 を返す
  - _Requirements: 6.1, 6.2, 6.3_
  - _Boundary: nuxt.config.ts_

- [x] 4. useGeolocation コンポ�Eザブル実裁E
  - `isLoaded` 後に GeolocateControl を右下に追加し、空 FeatureCollection の route GeoJSON ソースと青色・線幁E4px のルートラインレイヤーを地図に追加する
  - `geolocate` イベントで `userLocation: Ref<Coordinate | null>` を更新し、`map.on('render')` ハンドラーで `_watchState === 'OFF'` の場合�E `userLocation` をリセチE��する
  - zoom >= 7 かつ `userLocation` が非 null の場合�E `getVisibleLayerFilter()` を呼び出し、Turf.js で最寁E��避難場所を特定して route source の LineString を更新する。条件を満たさなぁE��合�E route source に空 FeatureCollection をセチE��する
  - GeolocateControl を有効化して現在地を取得すると、最寁E��の表示中避難場所まで青いルートラインが描画されめE
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - _Depends: 3.2_

- [x] 5. pages/index.vue 統吁E
  - `definePageMeta({ ssr: false })` を設定し、�EチE�EコンチE��要素の template ref めE`onMounted` で `initMap()` に渡ぁE
  - 初期化頁E��！EseMap ↁEuseHazardLayers ↁEuseShelters ↁEuseGeolocation ↁEuseTerrain�E�でコンポ�Eザブルを呼び出し、`onUnmounted` で `destroyMap()` を呼び出ぁE
  - 地図コンチE��に `height: 100vh` のフルスクリーン CSS を適用する
  - ペ�Eジを開くと地図が表示され、ハザードオーバ�Eレイ・避難場所フィルター・GPS ルート�E3D 地形の全機�Eが動作すめE
  - _Requirements: 1.1, 1.3, 6.4_
  - _Depends: 2, 3.1, 3.2, 3.3, 3.4, 4_

- [x] 6. Validation: チE��チE
- [ ]* 6.1 ユニットテスト実裁E
  - HAZARD_LAYERS 6 件・SHELTER_LAYERS 8 件・MAP_INIT 値の正確性を検証するチE��トを作�Eする
  - モチE�� Map インスタンスで `getVisibleLayerFilter()` の visibility 変化�E�フィルター返却・null 返却�E�を検証する
  - 褁E��地物の座標�E列を与えて最寁E��地物選択が正しいことめETurf.js 実ライブラリで検証する
  - 全チE��トが pass する
  - _Requirements: 2.1, 3.1, 3.2, 4.3_

- [ ]* 6.2 E2E チE��ト実裁E��Elaywright�E�E
  - ペ�EジローチEↁE地図コンチE��が表示されめE
  - ハザードレイヤーパネルでレイヤーを選抁EↁEオーバ�Eレイが地図上に表示されめE
  - 避難場所フィルターで災害種別を選抁EↁEマ�Eカーが表示され、クリチE��でポップアチE�Eが�EめE
  - `/manifest.json` ぁE200 を返し、Service Worker が登録されめE
  - _Requirements: 2.3, 3.4, 3.5, 6.1, 6.2_
