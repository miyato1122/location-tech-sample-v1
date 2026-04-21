# Implementation Plan: 背景地図切り替えと出典連動表示

**Branch**: `002-basemap-switch` | **Date**: 2026-04-21 | **Spec**: `/specs/002-basemap-switch/spec.md`
**Input**: Feature specification from `/specs/002-basemap-switch/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

地図画面の左下に背景地図切り替えUIを追加し、OpenStreetMap・地理院地図・航空写真の
3種を選択可能にする。選択中背景地図に対応して右下の出典表示を即時更新し、初期表示・
連続切り替え・失敗時においても背景地図と出典の整合を維持する。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (ES Modules), Node.js 18+  
**Primary Dependencies**: `maplibre-gl`, `maplibre-gl-gsi-terrain`, `maplibre-gl-opacity`, `@turf/distance`, `vite`  
**Storage**: 永続DBなし (フロントエンド状態管理のみ)  
**Testing**: 手動受け入れシナリオ + `npm run build` によるビルド整合確認  
**Target Platform**: ブラウザ (デスクトップ優先、既存モバイル表示も維持)  
**Project Type**: 単一フロントエンドアプリ  
**Performance Goals**: 背景地図切り替え操作後1秒以内に表示更新が開始されること (通常ネットワーク条件)  
**Constraints**: 出典表示は常に右下、切り替えUIは左下固定、文書は日本語で記述  
**Scale/Scope**: 1画面内の背景地図切り替え機能と出典表示連動のみ

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Defect Prevention Controls Defined**: 失敗系挙動、入力検証、例外処理、回帰
  防止策を計画に明示していること。
- **Test-First Strategy Defined**: ユーザーストーリーごとに失敗先行テストと
  回帰テスト方針を定義していること。
- **Safe Change Boundaries Defined**: 変更粒度、責務分離、非自明ロジックの
  根拠記録方針を定義していること。
- **Traceability and Review Scope Defined**: 変更が要件へ追跡可能で、レビュー
  単位が小さく保たれていること。
- **Japanese Documentation Requirement Satisfied**: 仕様・計画・タスク・運用
  手順の主要文書を日本語で管理する方針を記載していること。

判定: PASS

設計後再評価: PASS (`research.md` / `data-model.md` / `contracts/map-basemap-attribution-contract.md` /
`quickstart.md` を確認し、憲章原則との矛盾なし)

## Project Structure

### Documentation (this feature)

```text
specs/002-basemap-switch/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── map-basemap-attribution-contract.md
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
./
├── index.html
├── main.js
├── style.css
├── package.json
├── public/
│   ├── manifest.json
│   └── sw.js
├── .specify/
│   ├── memory/constitution.md
│   ├── scripts/bash/
│   └── templates/
└── specs/
  └── 002-basemap-switch/
```

**Structure Decision**: 既存の単一フロントエンド構成を維持し、UI制御と出典表示
ロジックを既存 `main.js` を中心に拡張する。新規バックエンドや別プロジェクト分割は行わない。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| なし | N/A | N/A |
