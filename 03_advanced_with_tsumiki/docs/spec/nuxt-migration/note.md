# nuxt-migration コンテキストノート

**作成日**: 2026-04-20

---

## プロジェクト概要

既存の防災マップPWA（`03_advanced_with_tsumiki/`）をNuxt 3 + Vue 3 Composition APIに移行する。
現在はVanilla JavaScript（`main.js` 603行）の単一ファイルSPA。

---

## 技術スタック

### 移行元（現行）

| 区分 | 技術 | バージョン |
|------|------|-----------|
| ビルドツール | Vite | ^3.2.0 |
| フレームワーク | なし（Vanilla JS） | — |
| マップ | MapLibre GL JS | ^2.4.0 |
| 距離計算 | @turf/distance | ^6.5.0 |
| レイヤーUI | maplibre-gl-opacity | ^1.4.0 |
| 地形データ | maplibre-gl-gsi-terrain | ^0.0.2 |
| PWA | 手動実装（sw.js + manifest.json） | — |
| 型定義 | なし（JS） | — |

### 移行先（Nuxt 3）

| 区分 | 技術 | 備考 |
|------|------|------|
| フレームワーク | Nuxt 3 | ssr: false（CSRのみ） |
| 言語 | TypeScript | Nuxt 3標準対応 |
| コンポーネント | Vue 3 Composition API | \<script setup\>形式 |
| マップ | MapLibre GL JS | 既存と同バージョン |
| 距離計算 | @turf/distance | 既存と同バージョン |
| レイヤーUI | maplibre-gl-opacity | ライブラリをそのまま使用 |
| 地形データ | maplibre-gl-gsi-terrain | 既存と同バージョン |
| PWA | @vite-pwa/nuxt | Nuxt 3対応モジュール |
| テスト | Vitest + Playwright | 単体 + E2E |

---

## composables 分割計画

| Composable | 責務 | 対応する既存コード |
|-----------|------|-----------------|
| `useMap` | マップ初期化・設定（bounds, zoom, center） | `main.js:15-32` |
| `useHazardLayers` | 6種ハザードマップのレイヤー追加・制御 | `main.js:35-100, 133-174` |
| `useShelterLayers` | 8種避難場所レイヤーの追加・フィルター制御 | `main.js:102-115, 187-363` |
| `useGeolocation` | GeolocateControlの初期化・位置情報追跡 | `main.js:418-425` |
| `useRoute` | 最寄り避難場所の計算・ルートライン描画 | `main.js:371-413, 542-577` |
| `useTerrain` | GSI標高タイル・TerrainControl・陰影図 | `main.js:580-602` |

---

## 既知の問題（移行時に同時修正）

### EDGE-101: ルート計算バグ（優先度: 高）

`getNearestFeature()` が `null` を返した場合の null チェック未対応。
`useRoute` composable 内で修正する。

```typescript
// 修正方針
const nearestFeature = getNearestFeature(lng, lat)
if (!nearestFeature) return  // ← この処理を追加
```

### XSS リスク（優先度: 中）

ポップアップのHTML生成を `setHTML` から Vue 3テンプレートバインディングに変更。
MapLibre GL JSのPopupを使わず、Vue Componentとして実装することも検討。

---

## 重要な設計上の制約

1. **SSR禁止**: MapLibre GL JSはブラウザ専用API（WebGL, window, document）を使用するためSSRは必ず無効化
2. **maplibre-gl-opacity維持**: OpacityControlは既存ライブラリを使用（Vueコンポーネント化しない）
3. **ベクトルタイル維持**: `public/skhb/` のPBFファイルはそのまま利用
4. **外部データソース維持**: GSI・OSMのタイルURLは変更しない

---

## 既存設計文書

- `docs/spec/disaster-prevention-map/requirements.md` — 既存の機能要件（EARS記法）
- `docs/spec/disaster-prevention-map/user-stories.md` — 既存ユーザーストーリー
- `docs/spec/disaster-prevention-map/acceptance-criteria.md` — 既存受け入れ基準
- `docs/design/disaster-prevention-map/architecture.md` — アーキテクチャ設計
- `docs/design/disaster-prevention-map/interfaces.ts` — TypeScript型定義（移行時に活用）
- `docs/tasks/` — 実装タスク一覧（機能ごとに分割済み）
