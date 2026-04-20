# ギャップ分析: hazard-map-app

## 1. 現状調査

### 主要ファイルと構成

| ファイル | 行数 | 役割 |
|---|---|---|
| `main.js` | ~603 行 | 全ロジックを含むモノリシックエントリーポイント |
| `index.html` | 19 行 | HTML シェル（Service Worker 登録含む） |
| `style.css` | 空 | スタイルなし（MapLibre CSS を JS でインポート） |
| `public/manifest.json` | 33 行 | PWA マニフェスト（4 サイズのアイコン定義） |
| `public/sw.js` | 2 行 | Service Worker スタブ（fetch ハンドラーのみ） |
| `public/skhb/**/*.pbf` | 多数 | 事前生成済みベクトルタイル（ズーム 5〜8） |

### アーキテクチャパターン

- **モノリシック構成**: すべてのロジックが `main.js` 1 ファイルに集約
- **宣言的スタイル定義**: MapLibre の `style` オブジェクトでソース・レイヤーを初期化時に一括定義
- **イベント駆動**: `map.on('load')` / `map.on('render')` / DOM イベントで処理を分岐
- **グローバル状態は最小**: `let userLocation = null` のみ
- **テストなし・TypeScript なし**

---

## 2. 要件と実装のマッピング

| 要件 | 実装状況 | 該当箇所（main.js 行） | 備考 |
|---|---|---|---|
| **1. ベース地図の表示** | ✅ 実装済み | 15–30, 125–132 | 初期座標・ズーム・範囲制限すべて実装 |
| **2. ハザードマップオーバーレイ** | ✅ 実装済み | 35–101, 133–175, 430–441 | 6 種類のレイヤー・不透明度 0.7・OpacityControl |
| **3. 避難場所の表示・フィルタリング** | ✅ 実装済み | 102–123, 186–364, 443–540 | 8 種別フィルター・ポップアップ・mousemove |
| **4. GPS ルート表示** | ✅ 実装済み | 115–123, 178–185, 415–425, 543–577 | GeolocateControl・Turf.js・毎フレーム更新 |
| **5. 3D 地形表示** | ✅ 実装済み | 580–603 | 陰影図・TerrainControl・標高倍率 1 倍 |
| **6. PWA 対応** | △ 部分実装 | index.html, public/ | マニフェスト・アイコン済み。**Service Worker はスタブのみ** |

### ギャップ詳細

#### GAP-1: Service Worker のキャッシュ戦略が未実装 【Missing】
- **現状**: `sw.js` は `fetch` イベントを登録するだけでキャッシュ処理なし
- **要件**: 「Service Worker でリソースのキャッシュを管理する」
- **影響**: オフライン動作が実質的に機能しない
- **備考**: Research Needed — Workbox 等のキャッシュ戦略を設計フェーズで検討

#### GAP-2: テストが存在しない 【Constraint】
- **現状**: テストファイル・テストフレームワーク一切なし
- **影響**: 要件の検証可能性がコードレビューのみに依存
- **備考**: Nuxt 移行時に Vitest / Playwright の導入を検討

#### GAP-3: TypeScript なし 【Constraint】
- **現状**: 純粋な ES モジュール（型なし）
- **影響**: MapLibre のスタイルオブジェクトや地物プロパティの型安全性が低い
- **備考**: Nuxt 移行時に TypeScript を導入予定

#### GAP-4: コンポーネント分割なし 【Constraint】
- **現状**: `main.js` が 600 行超のモノリス
- **影響**: Nuxt への移行は段階的な分割が必要（ページ・コンポーネント・コンポーザブル）
- **備考**: Nuxt 移行が別ブランチ（`nuxt-migration`）で進行中

---

## 3. 実装アプローチの選択肢

### Option A: 既存ファイルを拡張（現バニラ JS のまま改善）

**対象**: GAP-1（sw.js のキャッシュ追加）のみ

- `sw.js` に Cache API / Workbox を追加
- `main.js` は変更なし

**トレードオフ**:
- ✅ 最小変更、即時効果
- ❌ モノリスのまま維持、Nuxt 移行への貢献なし

**適用場面**: バニラ JS を維持しつつ PWA を完成させたい場合

---

### Option B: 新規コンポーネント作成（Nuxt への全面移行）

**対象**: 全要件を Nuxt/Vue コンポーネントとして再実装

- `pages/index.vue` — マップコンテナページ
- `composables/useMap.ts` — MapLibre 初期化ロジック
- `composables/useHazardLayers.ts` — ハザードレイヤー管理
- `composables/useShelters.ts` — 避難場所フィルター・ポップアップ
- `composables/useGeolocation.ts` — GPS・ルート計算
- `composables/useTerrain.ts` — 3D 地形

**トレードオフ**:
- ✅ 関心の分離、テスト容易性、TypeScript 対応
- ✅ Nuxt の SSR/SSG・PWA モジュールで GAP-1 を解決可能
- ❌ 全面書き直しのコスト
- ❌ `nuxt-map-app/` との調整が必要

**適用場面**: Nuxt 移行が主目的の場合（現在のブランチ方針と一致）

---

### Option C: ハイブリッドアプローチ（段階的移行）

**フェーズ 1（バニラ JS）**: GAP-1 のみ修正（sw.js に Workbox 追加）  
**フェーズ 2（Nuxt）**: Option B の構成で全面移行

**トレードオフ**:
- ✅ 現行バニラ版を壊さず、Nuxt 版と並行開発可能
- ✅ リスク分散（フェーズ 1 で即座に PWA 完成）
- ❌ 同じロジックを 2 つのコードベースで維持する期間が発生

**適用場面**: バニラ版の即時リリースと Nuxt 移行を並行させたい場合

---

## 4. 実装複雑度・リスク評価

| 対象 | 工数 | リスク | 根拠 |
|---|---|---|---|
| GAP-1 修正（sw.js キャッシュ）単体 | S | Low | Workbox の既知パターン、既存コード変更なし |
| Nuxt 全面移行（Option B） | L〜XL | Medium | MapLibre の Vue 統合・SSR 対応・`nuxt-map-app/` との整合が必要 |
| ハイブリッド（Option C） | M + L | Medium | フェーズ分割でリスクを分散できるが計画コストあり |

---

## 5. 設計フェーズへの推奨事項

### 推奨アプローチ
**Option B（Nuxt 全面移行）** — 現在の `nuxt-migration` ブランチ方針と一致し、GAP-1〜4 をすべて解決できる。

### 設計フェーズで検討すべき事項

1. **Service Worker 戦略** (GAP-1): Nuxt PWA モジュール（`@vite-pwa/nuxt`）vs 手動 Workbox 実装
2. **MapLibre と Vue の統合**: `onMounted` でインスタンス化、`ref` / `provide` での状態共有パターン
3. **ベクトルタイルの配信**: `public/skhb/` をそのまま Nuxt の `public/` に移行可能か確認
4. **`nuxt-map-app/` との関係**: 既存の Nuxt ワークスペースに機能を追加するか、このディレクトリ内に新設するか
5. **テスト戦略**: Vitest（ユニット）+ Playwright（E2E 地図操作）の導入

### Research Needed
- `@vite-pwa/nuxt` のキャッシュ戦略オプション（ネットワークファーストかキャッシュファーストか）
- MapLibre GL JS と Nuxt 3 の SSR 互換性（サーバーサイドで `window` 参照が発生するため `client-only` ラッパーが必要な可能性）
