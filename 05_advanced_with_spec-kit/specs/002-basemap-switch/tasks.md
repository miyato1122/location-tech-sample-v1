# Tasks: 背景地図刁E��替えと出典連動表示

**Input**: Design documents from `/specs/002-basemap-switch/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: チE��トタスクは忁E��。各ユーザースト�Eリーで失敗するテストを先に作�Eし、その後に実裁E��る、E

**Organization**: ユーザースト�Eリー単位で実裁E��検証が完結するよぁE��構�Eする、E

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能 (別ファイルかつ未完亁E��存なぁE
- **[Story]**: 対応するユーザースト�Eリー (US1, US2, US3)
- 吁E��スク説明には実ファイルパスを含める

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 背景地図刁E��替え機�E向けの共通検証基盤を整える、E

- [x] T001 チE��ト基盤チE��レクトリを作�Eする in tests/contract/.gitkeep tests/integration/.gitkeep tests/unit/.gitkeep
- [x] T002 品質ゲート実行スクリプトを定義する in package.json
- [x] T003 [P] 契紁E��スト実行エントリを作�Eする in tests/contract/run-contract-tests.mjs
- [x] T004 [P] 統合テスト実行エントリを作�Eする in tests/integration/run-integration-tests.mjs
- [x] T005 背景地図と出典の検証手頁E��日本語で定義する in docs/basemap-quality-gates.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのユーザースト�Eリーが依存する背景地図状態管琁E��整合制御を用意する、E

**⚠�E�ECRITICAL**: こ�Eフェーズ完亁E��にユーザースト�Eリー実裁E��開始しなぁE��E

- [x] T006 背景地図種別カタログを作�Eする in src/basemap/basemap-types.js
- [x] T007 [P] 背景地図と出典の対応ルールを実裁E��めEin src/basemap/attribution-rules.js
- [x] T008 背景地図表示状態モチE��を実裁E��めEin src/basemap/display-state.js
- [x] T009 刁E��替え失敗時のロールバック制御を実裁E��めEin src/basemap/state-guard.js
- [x] T010 エラー通知とログ補助を実裁E��めEin src/basemap/error-handler.js
- [x] T011 main.js に共通モジュール初期化を絁E��込む in main.js

**Checkpoint**: 共通基盤が整ぁE��各ユーザースト�Eリーを独立実裁E��きる状態、E

---

## Phase 3: User Story 1 - 左下で背景地図を�Eり替える (Priority: P1) 🎯 MVP

**Goal**: 左下UIで OpenStreetMap / 地琁E��地図 / 航空写真 を即時�Eり替え可能にする、E

**Independent Test**: 左下UIから3種を頁E��選択し、背景地図が選択と一致して更新されることを確認する、E

### Tests for User Story 1 (REQUIRED)

- [x] T012 [P] [US1] 背景地図選択肢3種の契紁E��ストを作�Eする in tests/contract/test-basemap-options.mjs
- [x] T013 [P] [US1] 左下UI配置の統合テストを作�Eする in tests/integration/test-basemap-switcher-position.mjs
- [x] T014 [P] [US1] 背景地図刁E��替え動作�E統合テストを作�Eする in tests/integration/test-basemap-switching.mjs

### Implementation for User Story 1

- [x] T015 [P] [US1] 背景地図刁E��替ぁEIコンポ�Eネントを実裁E��めEin src/ui/basemap-switcher.js
- [x] T016 [P] [US1] 左下UIスタイルを実裁E��めEin style.css
- [x] T017 [US1] 刁E��替ぁEIマウント領域を追加する in index.html
- [x] T018 [US1] UIイベントと背景地図刁E��替え�E琁E��接続すめEin main.js
- [x] T019 [US1] 同一背景地図再選択時の無駁E��新抑止を実裁E��めEin src/basemap/display-state.js

**Checkpoint**: US1 単体で背景地図刁E��替え価値を提供できる、E

---

## Phase 4: User Story 2 - 右下�E出典を背景地図に連動させる (Priority: P1)

**Goal**: 背景地図種別に応じて右下�E典を常時一致させる、E

**Independent Test**: 吁E��景地図への刁E��替え時に右下�E典斁E��が対応ルールどおり更新されることを確認する、E

### Tests for User Story 2 (REQUIRED)

- [x] T020 [P] [US2] 背景地図と出典対応表の契紁E��ストを作�Eする in tests/contract/test-attribution-rules.mjs
- [x] T021 [P] [US2] 右下�E典更新の統合テストを作�Eする in tests/integration/test-attribution-sync.mjs
- [x] T022 [P] [US2] 出典斁E��の日本語整備テストを作�Eする in tests/contract/test-attribution-japanese-text.mjs

### Implementation for User Story 2

- [x] T023 [US2] 右下�E典表示要素を定義する in index.html
- [x] T024 [P] [US2] 右下�E典スタイルを実裁E��めEin style.css
- [x] T025 [US2] 背景地図刁E��替え時の出典更新処琁E��実裁E��めEin main.js
- [x] T026 [US2] 出典表示ルール契紁E��最新化すめEin specs/002-basemap-switch/contracts/map-basemap-attribution-contract.md
- [x] T027 [US2] 出典表示ルールの運用説明を日本語で追記すめEin docs/basemap-quality-gates.md

**Checkpoint**: US1 と US2 で背景地図と出典の同期表示が�E立する、E

---

## Phase 5: User Story 3 - 初期表示時にも�E典整合を保つ (Priority: P2)

**Goal**: 初期表示・連続�Eり替え�E読み込み失敗時にも背景地図と出典の不一致を防ぐ、E

**Independent Test**: 初期表示、E��続�Eり替え、失敗注入の吁E��ースで背景地図と出典が一致することを確認する、E

### Tests for User Story 3 (REQUIRED)

- [x] T028 [P] [US3] 初期表示整合�E統合テストを作�Eする in tests/integration/test-initial-attribution-consistency.mjs
- [x] T029 [P] [US3] 連続�Eり替え整合�E統合テストを作�Eする in tests/integration/test-rapid-switch-consistency.mjs
- [x] T030 [P] [US3] 読み込み失敗時ロールバックの回帰チE��トを作�Eする in tests/unit/test-switch-failure-rollback.mjs

### Implementation for User Story 3

- [x] T031 [US3] 初期表示時�E背景地図と出典の同時初期化を実裁E��めEin main.js
- [x] T032 [US3] 読み込み失敗時に前回整合状態を維持する�E琁E��実裁E��めEin src/basemap/state-guard.js
- [x] T033 [US3] 連続�Eり替え時の最終状態確定ロジチE��を実裁E��めEin src/basemap/display-state.js
- [x] T034 [US3] 初期表示・失敗時挙動を日本語で明文化すめEin specs/002-basemap-switch/quickstart.md

**Checkpoint**: すべての要求シナリオで背景地図と出典の整合が維持される、E

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 横断品質と最終確認、E

- [x] T035 [P] 日本語ドキュメント�E用語統一を実施する in specs/002-basemap-switch/spec.md specs/002-basemap-switch/plan.md specs/002-basemap-switch/quickstart.md
- [x] T036 [P] 背景地図刁E��替え�E追加回帰チE��トを強化すめEin tests/unit/test-basemap-regression.mjs
- [x] T037 品質ゲート実行結果を記録する in docs/basemap-quality-gates.md
- [x] T038 quickstart 手頁E��実行し結果を反映する in specs/002-basemap-switch/quickstart.md
- [x] T039 本番向け最終確認メモを作�Eする in specs/002-basemap-switch/release-readiness.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): 依存なし、即時開始可能、E
- Phase 2 (Foundational): Phase 1 完亁E��に開始。�EUSをブロチE��、E
- Phase 3/4/5 (User Stories): Phase 2 完亁E��に開始、E
- Phase 6 (Polish): 実裁E��象の全US完亁E��に開始、E

### User Story Dependencies

- US1 (P1): Foundational 完亁E��に着手可能。最初�EMVP対象、E
- US2 (P1): Foundational 完亁E��に着手可能。US1 の刁E��替え結果に連動して価値を�Eす、E
- US3 (P2): US1/US2 の基盤を利用するため、US2 完亁E���E着手を推奨、E

### Within Each User Story

- チE��トタスクを�Eに作�Eし、失敗を確認する、E
- UI/状態管琁E�E実裁E��行う、E
- ドキュメントと契紁E��更新する、E
- Independent Test を満たすことを確認して次へ進む、E

### Parallel Opportunities

- Setup: T003 と T004 は並列実行可能、E
- Foundational: T007 と T010 は並列実行可能、E
- US1: T015 と T016 は並列実行可能、E
- US2: T020/T021/T022 は並列実行可能、E
- US3: T028/T029/T030 は並列実行可能、E
- Polish: T035 と T036 は並列実行可能、E

---

## Parallel Example: User Story 2

```bash
# US2 チE��トを並列で準備
Task: "背景地図と出典対応表の契紁E��ストを作�Eする in tests/contract/test-attribution-rules.mjs"
Task: "右下�E典更新の統合テストを作�Eする in tests/integration/test-attribution-sync.mjs"
Task: "出典斁E��の日本語整備テストを作�Eする in tests/contract/test-attribution-japanese-text.mjs"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1 Setup 完亁E
2. Phase 2 Foundational 完亁E
3. Phase 3 US1 完亁E
4. Phase 4 US2 完亁E
5. 背景地図刁E��替ぁE+ 出典連動�EMVP検証

### Incremental Delivery

1. US1 で刁E��替ぁEIを提侁E
2. US2 で出典連動を追加し法令/利用規紁E��点を満たす
3. US3 で初期状態�E失敗時整合を強匁E
4. Polish で回帰と斁E��整備を完亁E

### Parallel Team Strategy

1. 開発老E: 背景地図UIと状態管琁E
2. 開発老E: 出典表示と契紁EチE��チE
3. 開発老E: 初期化�E失敗時ロールバック・回帰チE��チE

---

## Notes

- [P] はファイル競合�E少なぁE��列可能タスク、E
- [USx] はタスクとユーザースト�Eリーの追跡用ラベル、E
- 全タスクに実ファイルパスを�E記、E
- チE��ト�E行と日本語文書整備を忁E��運用とする、E
