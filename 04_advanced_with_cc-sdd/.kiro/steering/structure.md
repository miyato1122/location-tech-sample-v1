# プロジェクト構成

## 構成の考え方

フラットなスクリプト優先構成。現バニラ JS ビルドは最小限のファイル構成で、HTML エントリーポイント・JS モジュール・スタイルシート・静的アセット用 `public/` ディレクトリのみ。コンポーネントディレクトリやモジュール分割はなく、すべてのロジックを `main.js` に集約しています。Nuxt 移行では別ワークスペース（`nuxt-map-app/`）にフィーチャー/レイヤーベースの構成を導入する予定。

## ディレクトリパターン

### アプリケーションエントリー
**場所**: `/index.html`、`/main.js`、`/style.css`  
**役割**: HTML シェル + 地図の初期化・イベントハンドラーを含む全ロジック  
**例**: `main.js` が MapLibre とプラグインをインポートし、スタイルオブジェクト全体を構築してイベントリスナーを登録する

### 静的アセット
**場所**: `/public/`  
**役割**: そのまま配信するファイル — PWA マニフェスト・Service Worker・ビルド済みベクトルタイル  
**例**: `/public/skhb/{z}/{x}/{y}.pbf`（避難場所ベクトルタイル）、`/public/sw.js`（Service Worker）、`/public/manifest.json`（PWA マニフェスト）

### ビルド成果物
**場所**: `/dist/`  
**役割**: Vite 本番ビルドの出力（GitHub Pages 配信のためリポジトリにコミット）  
**例**: `/dist/assets/index.<hash>.js`、`/dist/skhb/`（public からコピー）

### スペック
**場所**: `.kiro/specs/`  
**役割**: Kiro フィーチャースペック（フィーチャーごとの要件・設計・タスク）

### ステアリング
**場所**: `.kiro/steering/`  
**役割**: AI セッション全体に読み込まれるプロジェクトメモリ

## 命名規則

- **ファイル**: 静的アセットは `kebab-case`、エントリースクリプトは `camelCase`（`main.js`）
- **地図レイヤー ID**: `<ソース>-layer` サフィックス、災害レイヤーは番号付き（`skhb-1-layer`〜`skhb-8-layer`）
- **地図ソース ID**: 災害カテゴリに対応した `snake_case`（例: `hazard_flood`、`hazard_tsunami`）
- **JS 関数**: 動詞始まりの `camelCase`（例: `getCurrentSkhbLayerFilter`、`getNearestFeature`）

## インポートの順序

```javascript
// サードパーティライブラリ
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// プラグイン・ユーティリティ
import OpacityControl from 'maplibre-gl-opacity';
import distance from '@turf/distance';
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain';
```

現在の Vite 構成にパスエイリアスはなし（フラット構成のため不要）。Nuxt 移行後は `@/` または `~/` エイリアスを導入する可能性あり。

## コード構成の原則

- **1モジュール・トップダウン**: 地図初期化 → ヘルパー関数 → コントロール設定 → イベントハンドラーの順に記述
- **スタイルオブジェクトが唯一の真実**: ソースとレイヤーはすべて `new maplibregl.Map({ style: { ... } })` 内で宣言。動的に追加するレイヤーは `map.on('load', ...)` ハンドラー内で追加
- **グローバル状態は `userLocation` のみ**: GPS 位置を保持する `let userLocation` 変数だけがグローバル。その他の状態はイベント発火時に地図状態から都度導出する

---
_パターンを記録し、ファイルツリーを列挙しない。パターンに従った新ファイルはステアリングの更新を必要としない_
