# 防災マップ データフロー設計（逆生成）

## 分析日時

2026-04-20

---

## 1. アプリケーション起動フロー

```mermaid
sequenceDiagram
    participant B as ブラウザ
    participant SW as Service Worker
    participant V as Vite Dev / 静的ホスト
    participant OSM as OSM タイルサーバー
    participant GSI as GSI サーバー

    B->>SW: sw.js 登録（PWA）
    B->>V: index.html 要求
    V-->>B: HTML + main.js (ES Module)
    B->>B: MapLibre GL JS 初期化
    B->>B: マップコンテナ生成（zoom=5, center=[138,37]）
    B->>OSM: ラスタータイル取得（背景地図）
    OSM-->>B: PNG タイル
    B->>B: map.on('load') 発火
    B->>B: OpacityControl × 2 追加
    B->>B: GeolocateControl 追加
    B->>B: TerrainControl 追加
    B->>GSI: 標高タイル取得（hillshade 用）
    GSI-->>B: raster-dem タイル
    B->>B: hillshade レイヤー追加
```

---

## 2. ハザードマップ表示フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant UI as OpacityControl（左上）
    participant Map as MapLibre GL JS
    participant GSI as GSI ハザードマップCDN

    U->>UI: レイヤートグル操作
    UI->>Map: レイヤー visibility を 'visible' に変更
    Map->>GSI: ラスタータイル要求（{z}/{x}/{y}.png）
    GSI-->>Map: PNG タイルデータ
    Map->>Map: WebGL でタイルをレンダリング（opacity 0.7）
    Map-->>U: ハザードマップ表示
```

ハザードマップ一覧:

| レイヤーID | データURL |
|-----------|----------|
| `hazard_flood-layer` | `disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data` |
| `hazard_hightide-layer` | `disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data` |
| `hazard_tsunami-layer` | `disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data` |
| `hazard_doseki-layer` | `disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki` |
| `hazard_kyukeisha-layer` | `disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki` |
| `hazard_jisuberi-layer` | `disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki` |

---

## 3. 避難場所表示フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant UI as OpacityControl（右上）
    participant Map as MapLibre GL JS
    participant VT as ベクトルタイル（/skhb/）

    U->>UI: 災害種別選択（例: 地震）
    UI->>Map: skhb-4-layer を 'visible' に（他を 'none' に）
    Map->>VT: PBFタイル要求（{z}/{x}/{y}.pbf）
    VT-->>Map: プロトバッファデータ
    Map->>Map: filter: ['get', 'disaster4'] でフィルタリング
    Map->>Map: WebGL でサークルポイントをレンダリング
    Map-->>U: 地震対応避難場所のみ表示
```

---

## 4. 避難場所クリック（ポップアップ）フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant Map as MapLibre GL JS
    participant Popup as Popup コンポーネント

    U->>Map: 地図クリック
    Map->>Map: queryRenderedFeatures(e.point, {layers: skhb-*})
    alt 避難場所が存在する
        Map->>Map: features[0] を取得
        Map->>Popup: setLngLat(feature.geometry.coordinates)
        Map->>Popup: setHTML(name, address, remarks, disaster1-8)
        Popup-->>U: ポップアップ表示
    else 避難場所が存在しない
        Map->>Map: 処理終了（return）
    end
```

ポップアップ表示データ（ベクトルタイル属性から取得）:

| 属性 | 型 | 表示方法 |
|------|----|---------|
| `name` | String | 太字、1.2rem フォント |
| `address` | String | 通常テキスト |
| `remarks` | String（nullable） | `?? ''` でnull対応 |
| `disaster1`〜`disaster8` | Boolean | true: 通常色 / false: `color:#ccc` グレーアウト |

---

## 5. 位置情報取得・最近傍ルート描画フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant GC as GeolocateControl
    participant App as main.js
    participant Turf as @turf/distance
    participant Map as MapLibre GL JS

    U->>GC: 位置情報ボタンクリック
    GC->>U: ブラウザ位置情報権限要求
    U->>GC: 権限許可
    GC->>GC: Geolocation API で位置取得開始
    
    loop 位置情報更新のたびに
        GC->>App: geolocate イベント（coords）
        App->>App: userLocation = [lng, lat] 更新
    end

    loop レンダリング毎フレーム（map.on('render')）
        App->>App: geolocationControl._watchState チェック
        alt watchState === 'OFF'
            App->>App: userLocation = null
        end
        App->>App: zoom < 7 || userLocation === null チェック
        alt 条件を満たさない
            App->>Map: route ソースを空の FeatureCollection で更新
        else ルート描画条件を満たす
            App->>App: getCurrentSkhbLayerFilter() 実行
            App->>App: 表示中 skhb レイヤーの filter 条件取得
            App->>Map: querySourceFeatures('skhb', {filter})
            Map-->>App: 現在表示中の避難場所 features[]
            App->>Turf: distance([userLng, userLat], feature.coordinates) × 全features
            Turf-->>App: 各施設との距離（km）
            App->>App: reduce() で最小距離の施設を特定
            App->>Map: route ソースを LineString GeoJSON で更新
            Map->>Map: route-layer をレンダリング（#33aaff、4px）
        end
    end
```

---

## 6. 3D地形表示フロー

```mermaid
flowchart TD
    A[map.on load] --> B[useGsiTerrainSource の呼び出し]
    B --> C[maplibregl.addProtocol でカスタムプロトコル登録]
    C --> D[terrain ソース追加<br/>type: raster-dem]
    D --> E[hillshade レイヤー追加<br/>exaggeration: 0.2]
    D --> F[TerrainControl 追加]
    F --> G{ユーザーが3D地形をON}
    G -->|ON| H[map.setTerrain でソース指定<br/>exaggeration: 1]
    H --> I[WebGLで3D地形レンダリング]
    G -->|OFF| J[平面地図に戻る]
```

---

## 7. カーソル変更フロー（ホバー）

```mermaid
flowchart LR
    A[マウス移動] --> B[map.on mousemove]
    B --> C[queryRenderedFeatures e.point<br/>layers: skhb-*]
    C --> D{避難場所フィーチャーが存在?}
    D -->|Yes| E[canvas.style.cursor = 'pointer']
    D -->|No| F[canvas.style.cursor = '']
```

---

## 8. レイヤー状態フロー（OpacityControl による排他制御）

```mermaid
stateDiagram-v2
    [*] --> 全非表示: アプリ起動
    全非表示 --> 単一表示: ユーザーがレイヤー選択
    単一表示 --> 全非表示: 表示中レイヤーをOFF
    単一表示 --> 単一表示: 別レイヤーに切り替え

    note right of 単一表示
        OpacityControl は baseLayers を
        ラジオボタン的に排他制御する
        （同時に1レイヤーのみ visible）
    end note
```

---

## データフロー要約

```
ユーザー操作
    │
    ├── レイヤートグル → MapLibre GL JS レイヤー visibility 変更
    │                   → 外部タイルサーバーからオンデマンドにタイル取得
    │
    ├── 地図クリック  → queryRenderedFeatures → Popup HTML 生成 → 表示
    │
    ├── 位置情報ON   → GeolocateControl → userLocation 変数更新
    │                  → 毎フレーム: querySourceFeatures → Turf.js 最近傍計算
    │                  → route ソース GeoJSON 更新 → route-layer 描画
    │
    └── 地形3D ON    → TerrainControl → map.setTerrain → WebGL 3D レンダリング
```
