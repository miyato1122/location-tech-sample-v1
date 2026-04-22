# 実装計画: Nuxtへの移行とライブラリ更新

**Branch**: `002-nuxt-migration` | **Date**: 2026-04-22 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/002-nuxt-migration/spec.md`

---

## サマリー

バニラJS + Vite 3.2.0 構成の地図アプリを Nuxt（SPA モード）に移行する。
移行は2段階で実施する：まず `nuxt-apps/` ディレクトリで動作確認を行い、確認後にプロジェクトルートを置き換える。
同時に maplibre-gl v2.4.0 → v5.x・@turf/distance v6 → v7 など全依存ライブラリを最新安定版に更新する。

---

## 技術コンテキスト

**言語/バージョン**: JavaScript (ES Modules) + TypeScript（nuxt.config.ts のみ）  
**主要依存ライブラリ**:

- Nuxt 3.x（Vite 6.x 内蔵）
- maplibre-gl 5.x
- maplibre-gl-opacity 1.x（最新）
- maplibre-gl-gsi-terrain 0.x（最新）
- @turf/distance 7.x

**ストレージ**: なし（タイルは静的ファイルとして `public/` に配置）  
**テスト**: ブラウザ目視確認（憲法 原則III に基づき自動テスト不要）  
**ターゲットプラットフォーム**: モダンブラウザ（Chrome / Firefox / Safari 最新版）  
**プロジェクトタイプ**: SPA（ssr: false）  
**パフォーマンス目標**: 開発サーバー起動後5秒以内に地図表示完了  
**制約**: maplibre-gl はブラウザ専用のため SSR 不可  
**スコープ**: 単一ページアプリ（index のみ）、PWA は移行対象外

---

## 憲法チェック

| 原則 | 評価 | 説明 |
| ----- | ------ | ------ |
| I. 仕様書ファースト | ✅ 合格 | spec.md 作成・承認済みで実装開始 |
| II. 地図・位置情報中心設計 | ✅ 合格 | MapLibre GL JS を継続使用。@turf/distance・maplibre-gl-opacity も維持 |
| III. 最低限テスト | ✅ 合格 | ブラウザ目視確認を主要検証手段として採用 |
| IV. 日本語ドキュメント | ✅ 合格 | 全ドキュメント・コメントは日本語 |
| V. シンプルさ優先 | ✅ 合格 | 単一コンポーネント構成。過剰な抽象化なし |

**技術スタック逸脱**: 憲法の「ビルドツール: Vite」は Nuxt 内蔵 Vite で満たされる。「JavaScript」はメインロジックで維持（nuxt.config.ts のみ TS）。

> **ゲート**: 全原則合格。Phase 0 研究・Phase 1 設計に進む。

---

## プロジェクト構造

### ドキュメント（本フィーチャー）

```text
specs/002-nuxt-migration/
├── plan.md              # 本ファイル
├── research.md          # Phase 0 出力（完了）
├── data-model.md        # Phase 1 出力（完了）
├── quickstart.md        # Phase 1 出力（完了）
└── tasks.md             # Phase 2 出力（/speckit-tasks で生成）
```

### ソースコード

```text
06_advanced_with_spec-kit-cc/
├── nuxt-apps/                   # Phase 1: 移行先試験ディレクトリ
│   ├── pages/
│   │   └── index.vue            # エントリーページ
│   ├── components/
│   │   └── TheMap.vue           # 地図コンポーネント（全ロジック集約）
│   ├── assets/
│   │   └── css/
│   │       └── main.css         # グローバルCSS
│   ├── public/
│   │   └── skhb/                # 指定緊急避難場所ベクタータイル
│   ├── nuxt.config.ts           # ssr: false, CSS設定, head設定
│   └── package.json
│
├── [Phase 2 完了後に削除] index.html  # バニラJS版（Phase 2 で削除）
├── [Phase 2 完了後に削除] main.js     # バニラJS版（Phase 2 で削除）
├── [Phase 2 完了後に削除] style.css   # バニラJS版（Phase 2 で削除）
└── [Phase 2 完了後に削除] package.json # Vite版（Phase 2 で nuxt-apps/package.json で置き換え）
```

---

## 実装フェーズ

### Phase A: nuxt-apps セットアップ（P1）

1. `npx nuxi@latest init nuxt-apps` でプロジェクト作成
2. `nuxt-apps/` に依存ライブラリをインストール
3. `nuxt.config.ts` を設定（`ssr: false`、CSS、head）
4. `nuxt-apps/public/skhb/` に既存のベクタータイルをコピー

### Phase B: コンポーネント実装（P1）

1. `components/TheMap.vue` を実装（`main.js` の内容を移植）
   - `onMounted()` で `new maplibregl.Map()` を初期化
   - `onUnmounted()` で `map.remove()` を呼び出す
   - skhb タイル URL を `/skhb/{z}/{x}/{y}.pbf` に変更
2. 破壊的変更への対応:
   - `maplibregl.addProtocol` → `import { addProtocol } from 'maplibre-gl'` に変更
   - `geolocationControl._watchState === 'OFF'` → `trackuserlocationend` イベントに変更
   - `nearestFeature._geometry.coordinates` → `nearestFeature.geometry.coordinates` に変更
3. `assets/css/main.css` に `style.css` の内容を移行
4. `pages/index.vue` を作成

### Phase C: 動作確認（P1）

1. `npm run dev` で開発サーバー起動
2. [quickstart.md](quickstart.md) のチェックリスト全項目を目視確認
3. `npm run build && npm run preview` でプロダクションビルド確認

### Phase D: プロジェクトルート置き換え（P2）

> **前提**: Phase C の全項目確認済みの場合のみ実施

1. バニラJS固有ファイルの削除（`index.html`, `main.js`, `style.css`, `vite.config.js`）
2. ルートの `package.json` を `nuxt-apps/` の内容で置き換え
3. `nuxt-apps/` の Nuxt プロジェクトファイルをルートに移行
4. ルートから `npm run dev` で動作確認

---

## リスクと対応方針

| リスク | 影響 | 対応 |
| ------- | ------ | ------ |
| maplibre-gl v5 で `addProtocol` の互換性問題 | 地形が表示されない | named import に変更（research.md 参照） |
| `maplibre-gl-opacity` v5 非互換 | レイヤーコントロール機能停止 | `map.setLayoutProperty` 自前実装に切り替え |
| `maplibre-gl-gsi-terrain` v5 非互換 | GSI地形が表示されない | ライブラリの最新版確認・必要であれば `addProtocol` 直接呼び出しに変更 |
| プライベートAPI削除（`_watchState`, `_geometry`） | ランタイムエラー | イベントベース実装・標準GeoJSON に変更（research.md 参照） |
