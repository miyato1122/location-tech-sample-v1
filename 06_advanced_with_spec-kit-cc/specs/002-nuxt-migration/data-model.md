# データモデル: Nuxt移行

**作成日**: 2026-04-22  
**対象フィーチャー**: 002-nuxt-migration

---

## コンポーネント構成

### `pages/index.vue`

| 属性 | 値 |
|-----|---|
| 役割 | アプリのエントリーポイント。`TheMap` コンポーネントをフルスクリーンで表示する |
| 状態 | なし（状態は TheMap.vue が保持） |
| テンプレート | `<TheMap />` のみ |

---

### `components/TheMap.vue`

| 属性 | 説明 |
|-----|------|
| 役割 | maplibre-gl の初期化・地図操作ロジック全体を管理する |
| マウント | `onMounted()` 内で `new Map()` を呼び出す（SSR安全） |
| アンマウント | `onUnmounted()` 内で `map.remove()` を呼び出してメモリを解放する |

#### リアクティブ状態

| 変数名 | 型 | 説明 |
|-------|-----|------|
| `userLocation` | `[number, number] \| null` | 現在地の経緯度。GeolocateControl の更新に合わせて変化 |

#### 主要な内部処理フロー

```
onMounted()
  └─ new maplibregl.Map({ ... })           // 地図初期化
       └─ map.on('load', () => { ... })    // ロード完了後の設定
            ├─ new OpacityControl(...)     // ハザードマップコントロール追加
            ├─ new OpacityControl(...)     // 避難場所コントロール追加
            ├─ map.on('click', ...)        // ポップアップ表示
            ├─ map.on('mousemove', ...)    // カーソル変更
            ├─ map.on('render', ...)       // 経路ライン更新
            ├─ useGsiTerrainSource(...)    // 地形データ設定
            └─ document.querySelectorAll(...) // 背景地図切り替えラジオボタン

onUnmounted()
  └─ map.remove()                          // クリーンアップ
```

#### 背景地図データ（BASEMAPS 定数）

| id | label | layerId |
|----|-------|---------|
| `osm` | OpenStreetMap | `osm-layer` |
| `gsi-std` | 地理院地図 | `gsi-std-layer` |
| `gsi-photo` | 航空写真 | `gsi-photo-layer` |

#### マップソース一覧

| ソースID | タイプ | 説明 |
|---------|-------|------|
| `osm` | raster | OpenStreetMap 背景地図 |
| `gsi-std` | raster | 地理院地図（標準地図） |
| `gsi-photo` | raster | 国土地理院シームレス航空写真 |
| `hazard_flood` | raster | 洪水浸水想定区域 |
| `hazard_hightide` | raster | 高潮浸水想定区域 |
| `hazard_tsunami` | raster | 津波浸水想定区域 |
| `hazard_doseki` | raster | 土石流警戒区域 |
| `hazard_kyukeisha` | raster | 急傾斜警戒区域 |
| `hazard_jisuberi` | raster | 地滑り警戒区域 |
| `skhb` | vector | 指定緊急避難場所ベクタータイル |
| `route` | geojson | 現在地〜最寄り避難施設のライン |
| `terrain` | raster-dem | 国土地理院標高タイル（3D地形・陰影図用） |

#### マップレイヤー一覧

| レイヤーID | ソース | タイプ | 初期表示 |
|-----------|-------|-------|---------|
| `gsi-std-layer` | gsi-std | raster | 非表示 |
| `gsi-photo-layer` | gsi-photo | raster | 非表示 |
| `osm-layer` | osm | raster | 表示 |
| `hazard_flood-layer` | hazard_flood | raster | 非表示 |
| `hazard_hightide-layer` | hazard_hightide | raster | 非表示 |
| `hazard_tsunami-layer` | hazard_tsunami | raster | 非表示 |
| `hazard_doseki-layer` | hazard_doseki | raster | 非表示 |
| `hazard_kyukeisha-layer` | hazard_kyukeisha | raster | 非表示 |
| `hazard_jisuberi-layer` | hazard_jisuberi | raster | 非表示 |
| `route-layer` | route | line | 表示（データなし） |
| `skhb-1-layer` | skhb | circle | 非表示（disaster1フィルター） |
| `skhb-2-layer` | skhb | circle | 非表示（disaster2フィルター） |
| `skhb-3-layer` | skhb | circle | 非表示（disaster3フィルター） |
| `skhb-4-layer` | skhb | circle | 非表示（disaster4フィルター） |
| `skhb-5-layer` | skhb | circle | 非表示（disaster5フィルター） |
| `skhb-6-layer` | skhb | circle | 非表示（disaster6フィルター） |
| `skhb-7-layer` | skhb | circle | 非表示（disaster7フィルター） |
| `skhb-8-layer` | skhb | circle | 非表示（disaster8フィルター） |
| `hillshade` | terrain | hillshade | 表示 |

---

## ファイル構成（nuxt-apps/）

```
nuxt-apps/
├── pages/
│   └── index.vue                # エントリーページ
├── components/
│   └── TheMap.vue               # 地図コンポーネント（全ロジック）
├── public/
│   └── skhb/                    # 指定緊急避難場所ベクタータイル
│       ├── metadata.json
│       ├── 5/
│       ├── 6/
│       ├── 7/
│       └── 8/
├── assets/
│   └── css/
│       └── main.css             # グローバルCSS（#basemap-controlスタイル等）
├── nuxt.config.ts               # SSR無効・CSS設定
├── package.json
└── package-lock.json
```

---

## 依存ライブラリ（最新版）

| パッケージ | 現行バージョン | 移行後（最新安定版） | 役割 |
|-----------|-------------|-------------------|------|
| `nuxt` | — | ^3.x (最新) | フレームワーク（Vite内蔵） |
| `maplibre-gl` | ^2.4.0 | ^5.x (最新) | 地図レンダリング |
| `maplibre-gl-opacity` | ^1.4.0 | ^1.4.0 (最新) | レイヤー表示コントロール |
| `maplibre-gl-gsi-terrain` | ^0.0.2 | ^0.x (最新) | 地理院標高タイル |
| `@turf/distance` | ^6.5.0 | ^7.x (最新) | 地点間距離計算 |

---

## nuxt.config.ts の設計

```ts
export default defineNuxtConfig({
  ssr: false,           // maplibre-glはブラウザ専用
  css: [
    'maplibre-gl/dist/maplibre-gl.css',
    'maplibre-gl-opacity/dist/maplibre-gl-opacity.css',
  ],
  app: {
    head: {
      title: '位置情報アプリケーション開発実践編',
      meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      ],
    },
  },
})
```
