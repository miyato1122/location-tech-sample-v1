# データモデル: 背景地図切り替え機能

**フィーチャー**: 001-basemap-switcher
**作成日**: 2026-04-22

## 概要

本機能はUI状態管理のみを扱う。永続化データなし。

## エンティティ

### BasemapDefinition（背景地図定義）

実行時定数として `main.js` 内で定義する。

| フィールド | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| `id` | string | MapLibre ソースID兼ラジオボタン値 | `'osm'`, `'gsi-std'`, `'gsi-photo'` |
| `label` | string | UIに表示するラベル | `'OpenStreetMap'` |
| `layerId` | string | MapLibre レイヤーID | `'osm-layer'` |
| `tiles` | string[] | タイルURL配列 | `['https://.../{z}/{x}/{y}.png']` |
| `maxzoom` | number | タイルの最大ズームレベル | `19` |
| `tileSize` | number | タイルサイズ（px） | `256` |
| `attribution` | string | 帰属HTMLテキスト | `'&copy; OpenStreetMap contributors'` |

### ControlState（コントロール状態）

`main.js` 内のモジュールスコープ変数として管理する。

| フィールド | 型 | 説明 | 初期値 |
|-----------|-----|------|-------|
| `currentBasemapId` | string | 現在選択中の背景地図ID | `'osm'` |

## 状態遷移

```
[OSM表示] ──→ [地理院地図表示] ──→ [航空写真表示]
    ↑                                      │
    └──────────────────────────────────────┘
```

切り替えはいつでも任意の方向へ遷移可能。オーバーレイレイヤーの状態には影響しない。

## 背景地図定数（実装参照用）

```javascript
const BASEMAPS = [
  {
    id: 'osm',
    label: 'OpenStreetMap',
    layerId: 'osm-layer',
    // ソースは初期スタイルで定義済み（差し替えなし）
  },
  {
    id: 'gsi-std',
    label: '地理院地図',
    layerId: 'gsi-std-layer',
    tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
    maxzoom: 18,
    tileSize: 256,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
  },
  {
    id: 'gsi-photo',
    label: '航空写真',
    layerId: 'gsi-photo-layer',
    tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
    maxzoom: 18,
    tileSize: 256,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
  },
];
```
