# 技術スタック

## アーキテクチャ

シングルページの地図アプリケーション。地図・ソース・レイヤー・イベントハンドラーをすべて `main.js` 1ファイルで宣言的に構成するバニラ JS 構成。現在 `nuxt-migration` ブランチで Nuxt/Vue への移行を進めています。

## コア技術

- **言語**: JavaScript（ES モジュール。現バニラ構成では TypeScript なし）
- **ビルドツール**: Vite 3.x（`vite` / `vite build --base=./` / `vite preview`）
- **地図レンダラー**: MapLibre GL JS 2.4.x — すべての地図状態は `maplibregl.Map` インスタンスで管理
- **ランタイム**: ブラウザ（現構成は CSR のみ。Nuxt 移行後は SSR/SSG を追加予定）

## 主要ライブラリ

- **`maplibre-gl`** — ベクトル・ラスタータイル描画、レイヤー管理、位置情報コントロール、ポップアップ
- **`maplibre-gl-opacity`** — `OpacityControl` プラグインによるレイヤー表示切り替え UI
- **`@turf/distance`** — 2点間の測地距離計算（最寄り避難場所探索に使用）
- **`maplibre-gl-gsi-terrain`** — 地理院標高タイルを `raster-dem` ソースとして読み込む薄いラッパー

## 開発標準

### データソースの規約
外部タイル URL（OSM・地理院ハザードポータル・地理院標高）は MapLibre の `style` オブジェクト内にソースとして直接定義する。避難場所のベクトルタイルは `public/skhb/` から配信し、相対 URL パターン `${location.href}/skhb/{z}/{x}/{y}.pbf` で参照する。

### レイヤー命名規則
すべての地図レイヤーは `<ソースID>-layer` の形式（例: `hazard_flood-layer`、`skhb-1-layer`）。災害種別レイヤーはベクトルタイルの属性 `disaster1`〜`disaster8` に対応して `skhb-1`〜`skhb-8` と番号付けする。

### コード品質
現バニラ構成ではリンター・フォーマッターは未設定。Nuxt 移行時に ESLint + Prettier（Vue ルール）を導入する予定。

## 開発環境

### 必要ツール
- Node.js（18以上推奨）
- npm

### 主要コマンド
```bash
# 開発サーバー: npm run dev
# ビルド:       npm run build
# プレビュー:   npm run preview
```

## 重要な技術的決定

- **ビルドの相対ベース**: `--base=./` により、ビルド成果物を任意のサブディレクトリから配信可能（GitHub Pages の `/02_advanced/dist/` など）
- **レイヤー表示は MapLibre で管理**: `layout.visibility`（`visible`/`none`）で制御し、`OpacityControl` が自動で切り替える。DOM 操作は行わない
- **レンダリング毎のルート再計算**: 最寄り避難場所へのラインは `map render` イベントで毎フレーム再計算するシンプルな実装（パン操作に即応するが計算コストは高め）

---
_標準とパターンを記録し、すべての依存パッケージを列挙しない_
