---
name: basemap-switcher コンテキストノート
description: 背景地図切り替え機能の開発に必要なプロジェクトコンテキスト
type: project
---

# basemap-switcher コンテキストノート

**生成日**: 2026-04-21

---

## 技術スタック

| 区分 | 技術 | バージョン |
|------|------|-----------|
| マップライブラリ | MapLibre GL JS | ^2.4.0 |
| ビルドツール | Vite | ^3.2.0 |
| フレームワーク | Vanilla JavaScript（フレームワークなし） |
| モジュール形式 | ES Modules |

---

## 既存の背景地図実装

`main.js:15-32` にて `maplibregl.Map` を生成し、`style.sources.osm` に OSM ラスタータイルを定義。

```javascript
osm: {
    type: 'raster',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    maxzoom: 19,
    tileSize: 256,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
},
```

背景レイヤーは `style.layers` の先頭に配置。

---

## 追加する地図タイル情報

| 地図種別 | タイルURL | 形式 | 出典 |
|---------|----------|------|------|
| OpenStreetMap | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | PNG | © OpenStreetMap contributors |
| 地理院地図（標準） | `https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png` | PNG | 国土地理院 |
| 地理院航空写真 | `https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg` | JPEG | 国土地理院 |

---

## プロジェクト構造（関連部分）

```
03_advanced_with_tsumiki/
├── main.js          # アプリ全体（603行）。背景地図実装はL15-32
├── index.html       # エントリーポイント
└── style.css        # グローバルスタイル（現在空ファイル）
```

---

## 開発ルール

- フレームワークなし（Vanilla JS + ES Modules）
- MapLibre GL JS の `map.setStyle()` または `map.removeSource() / map.addSource()` で動的切り替えを実現
- 出典表示は MapLibre のデフォルト `attributionControl` に依存（ソース切り替えで自動更新）
- UIコントロールは `maplibregl.IControl` インターフェースを実装するカスタムコントロールとして追加
- CSS は `style.css` またはインラインスタイルで実装（CSS フレームワーク不使用）

---

## 関連ドキュメント

- [アーキテクチャ設計](../../design/disaster-prevention-map/architecture.md)
- [外部データソース仕様](../../design/disaster-prevention-map/api-endpoints.md)
- [既存要件定義書](../../spec/disaster-prevention-map/requirements.md)
