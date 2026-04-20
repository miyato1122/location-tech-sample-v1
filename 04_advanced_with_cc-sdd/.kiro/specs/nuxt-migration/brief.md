# Brief: nuxt-migration

## Problem

バニラ JS の 600 行超モノリシック `main.js` はテストが困難で TypeScript による型安全性がなく、Service Worker もスタブのみで未実装。位置情報エンジニア向けの参照実装として、Nuxt 3 コンポーザブル構成への移行が必要。

## Current State

- `main.js` 単一ファイル（603 行）にすべてのロジックが集約
- TypeScript 未使用（型安全性なし）
- `sw.js` はスタブのみ（キャッシュ処理なし）
- テスト容易性が低い（関心の分離なし）

## Desired Outcome

- `nuxt-map-app/` ワークスペースに Nuxt 3 + TypeScript 構成が新設される
- `hazard-map-app` スペックの全 6 要件（ベース地図・ハザードオーバーレイ・避難場所・GPS ルート・3D 地形・PWA）が同等に動作する
- `@vite-pwa/nuxt` による本格的な Workbox キャッシュが機能する
- コンポーザブル分割により関心が分離され、ユニットテストが可能になる

## Approach

`useMap` / `useHazardLayers` / `useShelters` / `useGeolocation` / `useTerrain` の 5 コンポーザブルに分割し、`pages/index.vue` が初期化順序を管理する構成。SSR は `definePageMeta({ ssr: false })` でページ単位に無効化。詳細は `design.md` を参照。

## Scope

- **In**: `nuxt-map-app/` ディレクトリの新規作成、Nuxt 3 アプリ設定、5 コンポーザブル実装、TypeScript 型定義、PWA 設定（`@vite-pwa/nuxt`）
- **Out**: 既存バニラ JS ファイルの変更、バックエンド API、SSR/SSG、`map render` 毎フレーム再計算の最適化

## Boundary Candidates

- Map インスタンス管理（`useMap`）
- ハザードレイヤー管理（`useHazardLayers`）
- 避難場所レイヤー管理（`useShelters`）
- GPS 追跡・ルートライン描画（`useGeolocation`）
- 3D 地形管理（`useTerrain`）
- PWA・Workbox 設定（`nuxt.config.ts`）

## Out of Boundary

- 既存バニラ JS ファイル（`main.js`・`index.html`・`style.css`）への変更
- 外部タイルサービスの可用性管理
- Vitest / Playwright テストの実装（設計書にて定義のみ）

## Upstream / Downstream

- **Upstream**: `hazard-map-app` スペック（全機能要件の定義元）
- **Downstream**: 将来的なテストスペック、機能追加スペック

## Existing Spec Touchpoints

- **Extends**: なし（新規ワークスペース `nuxt-map-app/` を作成）
- **Adjacent**: `hazard-map-app`（機能要件の参照元。要件変更時は両スペックを同期）

## Constraints

- MapLibre GL JS は SSR 非対応 → `definePageMeta({ ssr: false })` で CSR 専用化
- `maplibre-gl-opacity`・`maplibre-gl-gsi-terrain` に型定義なし → `types/shims.d.ts` でシム定義
- 既存バニラ JS 実装は変更しない
