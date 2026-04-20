# nuxt-migration タスク概要

**作成日**: 2026-04-20
**プロジェクト期間**: Phase 1〜4（推定 17日）
**推定工数**: 101時間
**総タスク数**: 17件

## 関連文書

- **要件定義書**: [📋 requirements.md](../spec/nuxt-migration/requirements.md)
- **設計文書**: [📐 architecture.md](../design/nuxt-migration/architecture.md)
- **インターフェース定義**: [📝 interfaces.ts](../design/nuxt-migration/interfaces.ts)
- **データフロー図**: [🔄 dataflow.md](../design/nuxt-migration/dataflow.md)
- **コンテキストノート**: [📝 note.md](../spec/nuxt-migration/note.md)

## フェーズ構成

| フェーズ | 目標 | タスク数 | 工数 | ファイル |
|---------|------|----------|------|----------|
| Phase 1 | プロジェクト基盤構築 | 5件 | 23h | TASK-0001〜0005 |
| Phase 2 | composables実装 | 6件 | 43h | TASK-0006〜0011 |
| Phase 3 | コンポーネント実装 | 3件 | 17h | TASK-0012〜0014 |
| Phase 4 | テスト・品質保証 | 3件 | 20h | TASK-0015〜0017 |

## タスク番号管理

**使用済みタスク番号**: TASK-0001 〜 TASK-0017
**次回開始番号**: TASK-0018

## 全体進捗

- [ ] Phase 1: プロジェクト基盤構築
- [ ] Phase 2: composables実装
- [ ] Phase 3: コンポーネント実装
- [ ] Phase 4: テスト・品質保証

## マイルストーン

- **M1: 基盤完成**（TASK-0005完了時）: Nuxt 3プロジェクト初期化・設定完了
- **M2: composables完成**（TASK-0011完了時）: 全6 composables実装完了
- **M3: UI完成**（TASK-0014完了時）: MapContainer.vue + ShelterPopup.vue + index.vue完成
- **M4: リリース準備完了**（TASK-0017完了時）: 全テスト通過・PWA動作確認完了

---

## Phase 1: プロジェクト基盤構築

**期間**: 推定3〜4日
**目標**: Nuxt 3プロジェクト初期化、依存パッケージ導入、型定義・静的ファイル配置、PWA設定、テスト環境構築
**成果物**: 動作するNuxt 3骨格 + 全設定ファイル

### タスク一覧

- [x] [TASK-0001: Nuxt 3プロジェクト初期化と依存パッケージ追加](TASK-0001.md) - 8h (DIRECT) 🔵 ✅ 完了 (2026-04-20)
- [x] [TASK-0002: TypeScript型定義ファイル作成（types/index.ts）](TASK-0002.md) - 3h (DIRECT) 🔵 ✅ 完了 (2026-04-20)
- [x] [TASK-0003: 静的アセットの配置（PBFタイル・PWAアイコン）](TASK-0003.md) - 2h (DIRECT) 🔵 ✅ 完了 (2026-04-20)
- [x] [TASK-0004: @vite-pwa/nuxtの設定](TASK-0004.md) - 4h (DIRECT) 🔵 ✅ 完了 (2026-04-20)
- [x] [TASK-0005: Vitest・Playwrightテスト環境構築](TASK-0005.md) - 6h (DIRECT) 🔵 ✅ 完了 (2026-04-20)

### 依存関係

```
TASK-0001 → TASK-0002
TASK-0001 → TASK-0003
TASK-0001 → TASK-0004
TASK-0001 → TASK-0005
TASK-0002 → TASK-0006〜0011（全composables）
```

---

## Phase 2: composables実装

**期間**: 推定6〜7日
**目標**: MapLibre GL JS の各機能をVue 3 Composition APIのcomposablesに移植
**成果物**: 6つのcomposables（useMap / useHazardLayers / useShelterLayers / useGeolocation / useRoute / useTerrain）

### タスク一覧

- [x] [TASK-0006: useMap composable実装](TASK-0006.md) - 8h (TDD) 🔵 ✅ 完了 (2026-04-20)
- [ ] [TASK-0007: useHazardLayers composable実装](TASK-0007.md) - 8h (TDD) 🔵
- [ ] [TASK-0008: useShelterLayers composable実装](TASK-0008.md) - 8h (TDD) 🔵
- [ ] [TASK-0009: useGeolocation composable実装](TASK-0009.md) - 6h (TDD) 🔵
- [ ] [TASK-0010: useRoute composable実装（EDGE-101バグ修正含む）](TASK-0010.md) - 8h (TDD) 🔵
- [ ] [TASK-0011: useTerrain composable実装](TASK-0011.md) - 5h (TDD) 🔵

### 依存関係

```
TASK-0002 → TASK-0006
TASK-0006 → TASK-0007
TASK-0006 → TASK-0008
TASK-0006 → TASK-0009
TASK-0008 → TASK-0010（getCurrentLayerFilter依存）
TASK-0009 → TASK-0010（userLocation依存）
TASK-0006 → TASK-0011
```

---

## Phase 3: コンポーネント実装

**期間**: 推定2〜3日
**目標**: Vueコンポーネントの実装（ShelterPopup.vue XSS修正・MapContainer.vue統合・index.vue）
**成果物**: 動作するSPA（地図表示・インタラクション全機能）

### タスク一覧

- [ ] [TASK-0012: ShelterPopup.vueコンポーネント実装（XSS修正）](TASK-0012.md) - 6h (TDD) 🔵
- [ ] [TASK-0013: MapContainer.vue実装（全composables統合）](TASK-0013.md) - 8h (TDD) 🔵
- [ ] [TASK-0014: pages/index.vue実装](TASK-0014.md) - 3h (TDD) 🔵

### 依存関係

```
TASK-0002 → TASK-0012（SkhbProperties型依存）
TASK-0006〜0011 → TASK-0013（全composables依存）
TASK-0012 → TASK-0013（ShelterPopup.vue依存）
TASK-0013 → TASK-0014（MapContainer依存）
```

---

## Phase 4: テスト・品質保証

**期間**: 推定2〜3日
**目標**: 単体テスト・E2Eテスト実装、ビルド・PWA動作確認
**成果物**: テスト完備・PWA動作確認済みのリリース候補

### タスク一覧

- [ ] [TASK-0015: Vitestユニットテスト実装](TASK-0015.md) - 8h (TDD) 🔵
- [ ] [TASK-0016: Playwright E2Eテスト実装](TASK-0016.md) - 8h (TDD) 🟡
- [ ] [TASK-0017: ビルド・PWA動作確認](TASK-0017.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0010 → TASK-0015（getNearestFeature EDGE-101テスト）
TASK-0012 → TASK-0015（ShelterPopup XSSテスト）
TASK-0014 → TASK-0016（index.vue完成後E2E）
TASK-0014 → TASK-0017（ビルド対象完成後）
TASK-0004 → TASK-0017（PWA設定完成後）
```

---

## 信頼性レベルサマリー

### 全タスク統計

- **総タスク数**: 17件
- 🔵 **青信号**: 16件 (94%)
- 🟡 **黄信号**: 1件 (6%)
- 🔴 **赤信号**: 0件 (0%)

### フェーズ別信頼性

| フェーズ | 🔵 青 | 🟡 黄 | 🔴 赤 | 合計 |
|---------|-------|-------|-------|------|
| Phase 1 | 5 | 0 | 0 | 5 |
| Phase 2 | 6 | 0 | 0 | 6 |
| Phase 3 | 3 | 0 | 0 | 3 |
| Phase 4 | 2 | 1 | 0 | 3 |

**品質評価**: ✅ 高品質

---

## クリティカルパス

```
TASK-0001 → TASK-0002 → TASK-0006 → TASK-0008 → TASK-0010 → TASK-0013 → TASK-0014 → TASK-0016 → TASK-0017
```

**クリティカルパス工数**: 約57時間
**並行作業可能工数**: 約44時間（TASK-0003/0004/0005/0007/0009/0011/0012/0015）

---

## タスクタイプ別集計

| タイプ | 件数 | 工数合計 |
|--------|------|----------|
| TDD | 11件 | 75h |
| DIRECT | 6件 | 27h（※） |

> ※ TASK-0001の工数はセットアップ作業全体の概算

---

## 次のステップ

タスクを実装するには:
- 全タスク順番に実装: `/tsumiki:kairo-implement`
- 特定タスクを実装: `/tsumiki:kairo-implement TASK-0001`
