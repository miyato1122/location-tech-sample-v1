# Research & Design Decisions

---
**Purpose**: hazard-map-app の技術設計を支える調査記録・アーキテクチャ評価・設計決定の根拠を記録する。
**Feature**: `hazard-map-app`
**Discovery Scope**: Complex Integration（既存バニラ JS アプリの Nuxt 3 全面移行）

---

## Summary

- **Feature**: `hazard-map-app`
- **Discovery Scope**: Complex Integration（バニラ JS 600 行超モノリスを Nuxt 3 コンポーザブル構成へ移行）
- **Key Findings**:
  - MapLibre GL JS は `window` / WebGL コンテキストに直接依存するため、Nuxt の SSR を `definePageMeta({ ssr: false })` でページ単位に無効化するアプローチが最も侵襲が少なく、既存の命令的 MapLibre API をそのまま活用できる。
  - `@vite-pwa/nuxt` の `workbox.runtimeCaching` でリソース種別（アプリシェル・外部タイル・ローカル SKHB タイル）ごとに異なるキャッシュ戦略を宣言的に設定でき、GAP-1（sw.js スタブ）を解消できる。
  - `useMap` コンポーザブルが `Ref<Map | null>` と `isLoaded: Ref<boolean>` を返し、他コンポーザブルが引数として受け取る設計が、依存関係の明示性とテスト容易性を最も高く確保できる。

---

## Research Log

### MapLibre GL JS と Nuxt 3 の SSR 互換性

- **Context**: MapLibre は `window`・`document`・WebGL コンテキストへ直接アクセスするため、Node.js 側のレンダリング時に `window is not defined` エラーが発生する可能性がある。
- **Sources Consulted**:
  - [nuxt-maplibre モジュール Q&A](https://gugustinette.github.io/nuxt-maplibre/about/q&a.html)
  - [vue-maplibre-gl Nuxt ガイド](https://indoorequal.github.io/vue-maplibre-gl/guide/nuxt.html)
  - [GitHub: Gugustinette/nuxt-maplibre](https://github.com/Gugustinette/nuxt-maplibre)
- **Findings**:
  - MapLibre は SSR 非対応。`<ClientOnly>` ラッパー、`definePageMeta({ ssr: false })` によるページ単位 CSR 化、`nuxt-maplibre` モジュールのいずれかで対処する。
  - `nuxt-maplibre` は `vue-maplibre-gl` の Nuxt ラッパーであり宣言的 API を提供するが、`maplibre-gl-opacity` / `maplibre-gl-gsi-terrain` プラグインとの互換性は未確認。
  - ページ全体が地図コンテンツであることから、`definePageMeta({ ssr: false })` でページを CSR 専用にする方法が最適。`onMounted` 内で MapLibre インスタンスを安全に初期化できる。
- **Implications**: `pages/index.vue` に `definePageMeta({ ssr: false })` を設定。Map インスタンス生成は `onMounted` コールバック内で行う。

### @vite-pwa/nuxt のキャッシュ戦略

- **Context**: GAP-1 として特定された `sw.js` スタブ問題（現状ではキャッシュ処理が存在しない）。オフライン動作を実現するキャッシュ戦略を設計する必要がある。
- **Sources Consulted**:
  - [@vite-pwa/nuxt Nuxt Modules ページ](https://nuxt.com/modules/vite-pwa-nuxt)
  - [Vite PWA Nuxt 3 フレームワークガイド](https://vite-pwa-org.netlify.app/frameworks/nuxt)
  - [Nuxt 3 PWA 実装記事 marcusn.dev（2024/12）](https://marcusn.dev/articles/2024-12/nuxt-3-pwa)
- **Findings**:
  - `@vite-pwa/nuxt` は Workbox を基盤とし、`nuxt.config.ts` の `pwa.workbox.runtimeCaching` 配列でリソースごとにキャッシュルールを宣言できる。
  - アプリシェル（JS/CSS）: `CacheFirst`（デフォルト、プリキャッシュ自動適用）
  - 外部タイル（OSM・ハザードポータル・地理院標高）: `NetworkFirst`（オンライン時は最新タイル優先、オフライン時はキャッシュにフォールバック）
  - ローカル SKHB タイル（`/skhb/**`）: `CacheFirst`（静的ファイルのため更新不要）
  - ビルド時に Service Worker が自動生成され、既存の `public/sw.js` スタブは不要になる。
- **Implications**: `nuxt.config.ts` の `pwa.workbox.runtimeCaching` に 3 つのルールを定義。既存 `public/sw.js` は `@vite-pwa/nuxt` 生成物に置き換える。

### コンポーザブル境界の設計

- **Context**: 600 行超のモノリシック `main.js` を Nuxt の composables として分割する境界設計。
- **Sources Consulted**: 既存 `main.js`（全 603 行）コード分析、`gap-analysis.md`
- **Findings**:
  - `main.js` の構造は「スタイルオブジェクト定義（ソース・レイヤー）」「`map.on('load')` 内のコントロール設定・イベント登録」「`map.on('render')` でのルート描画」の 3 段階。
  - ハザードレイヤー（2.x）と避難場所レイヤー（3.x）は独立して操作されており、境界が明確。
  - `userLocation` のみがグローバル状態として存在する（`let userLocation = null`）。`useGeolocation` コンポーザブルの `Ref<Coordinate | null>` に変換可能。
  - `getNearestFeature` は `getCurrentSkhbLayerFilter` に依存する。後者は現在表示中の `skhb` レイヤーのフィルター条件を返す。この依存を `useShelters.getVisibleLayerFilter()` として外部公開することで、`useGeolocation` が `useShelters` のレイヤー状態を参照できる設計にする。
  - SKHB タイル URL の `location.href` 参照は Nuxt では `window.location.origin` に置き換え可能。
- **Implications**: `useShelters` が `getVisibleLayerFilter(): FilterSpecification | null` を公開し、`useGeolocation` がそれを引数として受け取る設計を採用する。

---

## Architecture Pattern Evaluation

| オプション | 説明 | 強み | リスク・制約 | 備考 |
|---|---|---|---|---|
| コンポーザブル分割 | 関心ごとに Vue 3 Composable へ分割し、Map インスタンスを引数で共有 | テスト容易・TypeScript 対応・境界明確 | pages/index.vue が初期化順序を管理する責任を持つ | **選択** |
| nuxt-maplibre モジュール | vue-maplibre-gl ベースのコンポーネント API | 宣言的・Nuxt 統合が容易 | maplibre-gl-opacity / maplibre-gl-gsi-terrain との互換性不明 | 却下 |
| バニラ JS を Nuxt plugin 化 | main.js を Nuxt プラグインとして読み込む | 変更最小 | 型安全性なし・分割不可・GAP-2〜4 未解消 | 却下 |

---

## Design Decisions

### Decision: Map インスタンスの共有方法

- **Context**: 複数のコンポーザブルが同一の `maplibregl.Map` インスタンスを操作する。
- **Alternatives Considered**:
  1. `provide/inject` — Nuxt app-level で Map インスタンスを注入
  2. 引数渡し — `useMap` が返す `Ref<Map | null>` を各コンポーザブルが引数として受け取る
  3. モジュールレベルシングルトン `ref` — グローバル変数として共有
- **Selected Approach**: `useMap` が `Ref<Map | null>` と `isLoaded: Ref<boolean>` を返し、各コンポーザブルが引数として受け取る。
- **Rationale**: 依存関係が呼び出しサイトで明示的であり、テスト時にモックを注入しやすい。`provide/inject` はコンポーネント階層外での利用が煩雑。
- **Trade-offs**: `pages/index.vue` がコンポーザブルの初期化順序を把握・管理する責任を持つ。
- **Follow-up**: `isLoaded` が `true` になるまで各コンポーザブルの `map.on('load')` 相当処理を `watchEffect` で待機させることで、タイミング依存を排除する。

### Decision: CSR 専用ページ vs ClientOnly ラッパー

- **Context**: MapLibre の SSR 非互換性への対処。
- **Alternatives Considered**:
  1. `definePageMeta({ ssr: false })` — ページ単位で SSR 無効化
  2. `<ClientOnly>` — コンポーネント単位でラップ
- **Selected Approach**: `definePageMeta({ ssr: false })`
- **Rationale**: ページ全体が地図コンテンツであり SSR の価値がない。全コンポーザブルを `onMounted` 内で安全に実行でき、`<ClientOnly>` のローディングスロット管理が不要になる。
- **Trade-offs**: SEO インデックスが困難。ただし本アプリはエンジニア向け参照実装であり SEO 最適化は要件外。

### Decision: Service Worker 実装方法（GAP-1 解消）

- **Context**: 既存 `sw.js` スタブをキャッシュ機能付きの本格 Service Worker に置き換える。
- **Alternatives Considered**:
  1. `@vite-pwa/nuxt` — Workbox 統合の宣言的設定
  2. 手動 Workbox 実装 — `sw.js` に直接キャッシュロジックを記述
- **Selected Approach**: `@vite-pwa/nuxt`
- **Rationale**: `nuxt.config.ts` の宣言的設定でビルド時に SW を自動生成し、Nuxt のビルドパイプラインと統合される。アプリシェルのプリキャッシュが自動化され、手動管理コストがゼロになる。
- **Trade-offs**: 生成される `sw.js` は `@vite-pwa/nuxt` が管理するため直接編集不可。ただし `runtimeCaching` の柔軟な設定でカバーできる。

---

## Risks & Mitigations

- `maplibre-gl-opacity` v1.4.0 が TypeScript 型定義を持たない可能性 — `types/shims.d.ts` に `declare module 'maplibre-gl-opacity'` シムを追加して対処する。
- `maplibre-gl-gsi-terrain` v0.0.2 が TypeScript 型定義を持たない可能性 — 同様に `declare module` シムで補完する。
- `map render` イベントの毎フレームルート再計算によるパフォーマンス影響 — 現行実装をそのまま移植し、実測後に必要なら `throttle` 最適化を検討する（本スペックの変更対象外）。
- SKHB タイル URL 解決（`location.href` → Nuxt 環境）— `onMounted` 内で `window.location.origin` を使用することで同等の動作を確保する。

---

## References

- [nuxt-maplibre Q&A](https://gugustinette.github.io/nuxt-maplibre/about/q&a.html) — SSR 非互換の理由と対処法
- [vue-maplibre-gl Nuxt ガイド](https://indoorequal.github.io/vue-maplibre-gl/guide/nuxt.html) — ClientOnly / ssr:false パターン
- [@vite-pwa/nuxt Nuxt Modules](https://nuxt.com/modules/vite-pwa-nuxt) — インストール・設定リファレンス
- [Vite PWA Nuxt 3 フレームワークガイド](https://vite-pwa-org.netlify.app/frameworks/nuxt) — runtimeCaching 設定例
- [Nuxt 3 PWA 実装記事](https://marcusn.dev/articles/2024-12/nuxt-3-pwa) — @vite-pwa/nuxt の実践的設定例
