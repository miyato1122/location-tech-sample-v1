# 技術スタック

updated_at: 2026-04-21

## アーキテクチャ

MapLibre GL のフルページマップを主UIとするシングルページアプリケーション（SPA）。マップのソース・レイヤー・インタラクションはすべて `main.js` 一本に定義されている。

## 主要技術

- **言語**: JavaScript（ES Modules）
- **ビルドツール**: Vite 3
- **ランタイム**: ブラウザ（現 Vite ビルドはサーバーサイドレンダリングなし）
- **マップエンジン**: MapLibre GL JS 2.x

## 主要ライブラリ

- **`maplibre-gl`**: マップのコアレンダリング — ソース・レイヤー・コントロールすべてを管理
- **`maplibre-gl-opacity`**: ラスター／ベクターレイヤーの表示切替コントロール（ハザードオーバーレイと避難施設レイヤーの両方で使用）
- **`@turf/distance`**: 最寄り避難施設を求めるための測地距離計算
- **`maplibre-gl-gsi-terrain`**: 地理院ラスターDEM標高タイルを3D地形として読み込むアダプター

## 開発標準

### コード品質
- バニラJS — Vite ビルドに TypeScript は使用しない。型チェックは行わない
- コメントは日本語が標準（対象読者が日本語話者のため）

### データパターン
- ハザードラスター: GSI Disaportal のタイルエンドポイントを使用。`maplibre-gl-opacity` で opacity を制御
- 避難施設: `public/skhb/` 以下のセルフホスト型ベクトルタイル（`.pbf`）。MapLibre の `filter` 式で災害種別ごとに絞り込み
- 位置情報: MapLibre `GeolocateControl` を使用。`geolocate` イベントごとに `userLocation` を更新
- 最寄り施設計算: `render` フレームごとに `querySourceFeatures` + `@turf/distance` reduce で計算

## 開発環境

### 必要ツール
- Node.js（LTS）
- npm

### 主要コマンド
```bash
# 開発サーバー: npm run dev
# ビルド:       npm run build
# プレビュー:   npm run preview
```

## 主要な技術的判断

- **レイヤーのデフォルトは `visibility: 'none'`**: ハザード・避難施設レイヤーはすべてデフォルト非表示。`OpacityControl` が唯一の表示切替手段
- **フレームごとのルーティング**: ルートラインはイベント駆動ではなくマップの `render` フレームごとに再計算することでリアルタイム性を確保
- **`OpacityControl` を2インスタンス分離**: ハザードオーバーレイ（左上）と避難施設レイヤー（右上）でコントロールを独立させUI競合を回避

---
_標準とパターンを記述する。すべての依存関係を列挙しない_
