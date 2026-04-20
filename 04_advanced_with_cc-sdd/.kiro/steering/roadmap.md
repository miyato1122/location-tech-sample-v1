# Roadmap

## Overview

バニラ JS で実装されたハザードマップアプリ（`main.js` 単一ファイル、603 行）を Nuxt 3 コンポーザブル構成へ移行するプロジェクト。スペックを「機能要件（フレームワーク非依存）」と「Nuxt 移行実装」の 2 つに分割し、責任境界を明確にする。

## Approach Decision

- **Chosen**: 機能要件と移行実装要件の分離
- **Why**: 将来的に別フレームワークへの移行や機能追加が生じた場合に、機能要件を再利用・参照できる。また設計レビューの観点が「何をすべきか」と「どう実装するか」に分かれ、承認プロセスがシンプルになる。
- **Rejected alternatives**: 機能要件と移行要件を同一スペックに混在させる案（境界が曖昧になり設計変更時の影響範囲が広がる）

## Scope

- **In**: ハザードマップアプリの機能要件整備、Nuxt 3 への完全移行（`nuxt-map-app/` ワークスペース新設）
- **Out**: バックエンド API、ユーザー認証、リアルタイム災害情報、SSR/SSG

## Constraints

- 既存バニラ JS ファイル（`main.js`・`index.html`・`style.css`）は変更しない
- MapLibre GL JS は SSR 非対応のため CSR 専用構成を維持する
- `hazard-map-app` の requirements.md（承認済み）は機能要件スペックとして再利用する

## Boundary Strategy

- **Why this split**: 機能要件はフレームワーク非依存で再利用可能。移行要件は実装技術（Nuxt 3・TypeScript・コンポーザブル）に依存するため分離する。
- **Shared seams to watch**: `nuxt-migration` は `hazard-map-app` の全要件を満たす責務を持つ。要件変更時は両スペックを同期して更新する。

## Specs (dependency order)

- [x] hazard-map-app -- ハザードマップアプリのフレームワーク非依存機能要件（要件承認済み）. Dependencies: none
- [ ] nuxt-migration -- Nuxt 3 移行の要件・設計・実装. Dependencies: hazard-map-app
