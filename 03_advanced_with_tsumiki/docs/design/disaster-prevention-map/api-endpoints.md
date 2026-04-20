# 防災マップ 外部データソース仕様（逆生成）

## 分析日時

2026-04-20

---

## 概要

本アプリケーションは自前のAPIサーバーを持たない。すべてのデータは以下の外部タイルサーバーおよびローカルの静的ファイルから取得する。

---

## 1. OpenStreetMap タイルサーバー

### ラスタータイル（背景地図）

| 項目 | 詳細 |
|------|------|
| URL | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` |
| 形式 | PNG ラスタータイル |
| ズーム範囲 | 最大 z=19 |
| タイルサイズ | 256px |
| 認証 | なし |
| 属性表示 | `© OpenStreetMap contributors` |

**パラメータ**:

| パラメータ | 説明 |
|-----------|------|
| `{z}` | ズームレベル（整数） |
| `{x}` | タイルX座標 |
| `{y}` | タイルY座標 |

---

## 2. 国土地理院 ハザードマップポータル（ラスタータイル）

**ベースURL**: `https://disaportaldata.gsi.go.jp/raster/`

### 共通仕様

| 項目 | 詳細 |
|------|------|
| 形式 | PNG ラスタータイル |
| ズーム範囲 | z=2〜17 |
| タイルサイズ | 256px |
| 認証 | なし |
| 属性表示 | `ハザードマップポータルサイト` |

### エンドポイント一覧

| ハザード種別 | パス |
|-----------|------|
| 洪水浸水想定区域（L2） | `01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png` |
| 高潮浸水想定区域（L2） | `03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png` |
| 津波浸水想定区域 | `04_tsunami_newlegend_data/{z}/{x}/{y}.png` |
| 土石流警戒区域 | `05_dosekiryukeikaikuiki/{z}/{x}/{y}.png` |
| 急傾斜地崩壊警戒区域 | `05_kyukeishakeikaikuiki/{z}/{x}/{y}.png` |
| 地滑り警戒区域 | `05_jisuberikeikaikuiki/{z}/{x}/{y}.png` |

---

## 3. 指定緊急避難場所 ベクトルタイル（ローカル静的ファイル）

### エンドポイント

| 項目 | 詳細 |
|------|------|
| URL | `{location.href}/skhb/{z}/{x}/{y}.pbf` |
| 形式 | Protocol Buffers（PBF）ベクトルタイル |
| ズーム範囲 | z=5〜8 |
| 生成ツール | Tippecanoe v2.9.1 |
| 属性表示 | `国土地理院:指定緊急避難場所データ` |
| データ件数 | 約112,525件 |

**注意**: `{location.href}` はアプリのデプロイURLに動的に決定される（`main.js:106-109`）。

### ベクトルタイル レイヤー仕様

**レイヤー名**: `skhb`

**フィーチャー型**: Point（緯度経度座標）

**属性（Properties）**:

| 属性名 | 型 | 説明 |
|-------|-----|------|
| `name` | String | 施設名称 |
| `address` | String | 住所 |
| `remarks` | String \| null | 備考・利用条件 |
| `disaster1` | Boolean | 洪水対応 |
| `disaster2` | Boolean | 崖崩れ・土石流・地滑り対応 |
| `disaster3` | Boolean | 高潮対応 |
| `disaster4` | Boolean | 地震対応 |
| `disaster5` | Boolean | 津波対応 |
| `disaster6` | Boolean | 大規模火事対応 |
| `disaster7` | Boolean | 内水氾濫対応 |
| `disaster8` | Boolean | 火山現象対応 |

### metadata.json

`public/skhb/metadata.json` にタイルメタデータが格納されている。

```json
{
  "attribution": "<a href='https://www.gsi.go.jp/bousaichiri/hinanbasho.html' target='_blank'>国土地理院:指定緊急避難場所データ</a>",
  "description": "skhb",
  "format": "pbf",
  "generator": "tippecanoe v2.9.1",
  "maxzoom": 8,
  "minzoom": 5,
  "name": "skhb",
  "type": "overlay",
  "vector_layers": [
    {
      "id": "skhb",
      "fields": {
        "address": "String",
        "disaster1": "Boolean",
        "disaster2": "Boolean",
        "disaster3": "Boolean",
        "disaster4": "Boolean",
        "disaster5": "Boolean",
        "disaster6": "Boolean",
        "disaster7": "Boolean",
        "disaster8": "Boolean",
        "name": "String",
        "remarks": "String"
      },
      "geometry": "Point",
      "minzoom": 5,
      "maxzoom": 8
    }
  ]
}
```

---

## 4. 国土地理院 標高タイル（地形データ）

### エンドポイント

`maplibre-gl-gsi-terrain` プラグインが内部的に処理する。

| 項目 | 詳細 |
|------|------|
| 提供元 | 国土地理院 |
| 形式 | raster-dem（RGB エンコード標高） |
| プロトコル | カスタムプロトコル（`maplibregl.addProtocol` で登録） |
| 用途 | ヒルシェード・3D地形表示 |

---

## 5. ブラウザ Geolocation API

サードパーティAPIではなくブラウザネイティブAPIを使用。

| 項目 | 詳細 |
|------|------|
| API | `navigator.geolocation`（Geolocation API） |
| 実装 | `maplibregl.GeolocateControl`（MapLibre GL JS ラッパー） |
| オプション | `trackUserLocation: true`（継続追跡） |
| イベント | `geolocate`（位置情報更新時） |
| 返却値 | `{ coords: { longitude, latitude } }` |

---

## エラーハンドリング

現在のアプリケーションに明示的なAPIエラーハンドリングは実装されていない。MapLibre GL JS の組み込みエラー処理に委ねられている。

**推奨追加対応**:

| エラーケース | 推奨対応 |
|------------|---------|
| タイルサーバー応答なし | リトライ or ユーザー向けエラー表示 |
| Geolocation 権限拒否 | ガイダンス表示 |
| ベクトルタイル取得失敗 | フォールバック表示 |
| `getNearestFeature()` が null 返却 | null チェックとルート描画スキップ処理 |
