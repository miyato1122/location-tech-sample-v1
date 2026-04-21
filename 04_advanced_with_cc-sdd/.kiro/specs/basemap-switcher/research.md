## Summary
- **Feature**: `basemap-switcher`
- **Discovery Scope**: Extension
- **Key Findings**:
  - 既存実装は `main.js` の単一スタイル定義に背景地図・ハザード・避難施設・ルートを集約しており、背景地図拡張は同一パターンに沿うのが最小リスク
  - 既存コントロールは左上・右上・右下を使用中で、要件指定の左下配置は機能衝突を回避しやすい
  - OSM/GSI ともに可視出典表示が重要な制約であり、背景切替に連動した attribution 更新を設計上の必須契約にする必要がある

## Research Log
### 既存拡張ポイントの確認
- **Context**: 背景地図切替を追加するため、既存の地図初期化・コントロール配置・表示状態管理の拡張余地を確認
- **Sources Consulted**: `main.js`, `index.html`, `.kiro/steering/tech.md`, `.kiro/steering/structure.md`
- **Findings**:
  - 背景地図は `osm` source + `osm-layer` の単一構成
  - ハザード/避難施設は `visibility: none` を初期値としてコントロールで切替
  - `map.on('load')` 内でコントロール追加・イベント登録を集中管理
- **Implications**:
  - 背景地図切替も同じ「source/layer宣言 + visibility制御 + load時コントロール追加」パターンで統一可能
  - 既存機能非回帰の設計境界を明確にしやすい

### タイル利用条件と出典表示
- **Context**: Requirement 4 の出典表示設計とエラー時振る舞いを具体化するため
- **Sources Consulted**: OSM Tile Usage Policy, 地理院タイル一覧
- **Findings**:
  - OSM は可視 attribution と適切な利用形態（スクレイピング/オフライン前提の不許可）を要求
  - 地理院タイルは出典明示と一覧ページへの導線が必要（タイル種別により追加出典が必要な場合あり）
- **Implications**:
  - 本設計では「表示中背景地図に対応した出典を常時可視」を契約化
  - オフライン配信や事前大量取得は本spec境界外として固定

## Architecture Pattern Evaluation
| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Style再生成 | 背景変更時に style 全体を差し替える | 設定の独立性が高い | 既存レイヤー状態・イベント再初期化の副作用が大きい | 既存単一ファイル構成に不向き |
| 排他レイヤー切替 | 背景3レイヤーを常設し visibility を切替 | 既存構成に最小差分で整合 | attributionと初期状態の管理が必要 | 採用 |
| 外部切替プラグイン導入 | 新規依存で切替UIを委譲 | 実装量削減の可能性 | 依存増加と保守性低下 | 現段階は不採用 |

## Design Decisions
### Decision: 背景切替は排他レイヤー方式を採用
- **Context**: Requirement 1, 2 の背景切替と非回帰を同時に満たす必要
- **Alternatives Considered**:
  1. Style再生成
  2. 排他レイヤー切替
- **Selected Approach**: 3種背景を source/layer として保持し、表示中レイヤーのみ可視にする
- **Rationale**: 既存ハザード・避難施設・ルートの動作面を変えずに要件達成できる
- **Trade-offs**: メモリ上のsource/layerは増えるが、再初期化リスクを低減できる
- **Follow-up**: 切替時の表示状態維持と attribution 更新を結合テストで確認

### Decision: 左下に専用 BasemapControl を配置
- **Context**: Requirement 1.1, 3.1, 3.3
- **Alternatives Considered**:
  1. 既存 OpacityControl への統合
  2. 専用コントロール追加
- **Selected Approach**: 左下専用コントロールを追加
- **Rationale**: 既存左上/右上の責務分離を保ち、操作競合を抑える
- **Trade-offs**: UI要素が増えるため狭画面での表示配慮が必要
- **Follow-up**: モバイル幅での視認性確認をテスト戦略に明記

### Decision: 出典表示は背景選択状態に同期
- **Context**: Requirement 4.1, 4.2
- **Alternatives Considered**:
  1. 固定文言表示
  2. 背景選択同期表示
- **Selected Approach**: 選択背景に同期した出典表示
- **Rationale**: 利用条件順守と利用者理解の両立
- **Trade-offs**: 表示ロジックが増える
- **Follow-up**: 表示失敗時メッセージと併せたUX確認

### Decision: Synthesis outcomes
- **Context**: 設計合成（Generalization / Build vs Adopt / Simplification）
- **Alternatives Considered**:
  1. 背景ごと個別処理
  2. 共通定義配列 + 汎用切替ロジック
- **Selected Approach**: 背景レイヤー定義を共通メタデータ化し、1つの切替手続きで扱う
- **Rationale**:
  - Generalization: 背景を「選択可能なベースレイヤー」という共通概念へ統一
  - Build vs Adopt: 既存 MapLibre コントロール拡張のみで実現し、新規依存は導入しない
  - Simplification: 将来拡張余地を残しつつ、現要件3レイヤーに限定
- **Trade-offs**: メタデータとUI表示名の整合管理が必要
- **Follow-up**: 要件ID 1.x / 3.x / 4.x に対するトレーサビリティ維持

## Risks & Mitigations
- 背景切替で既存表示状態が崩れるリスク — 切替前後でハザード・避難施設・ルート状態の非回帰テストを必須化
- 出典表示漏れリスク — 背景種別ごとの出典マッピングを必須入力にし、欠落時は切替不成立として扱う
- 狭画面でコントロールが地図閲覧を阻害するリスク — 左下UIの最小幅・折返し・省スペース表示を設計要件に含める

## References
- [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) — OSMタイル利用条件と attribution 条件
- [地理院タイル一覧](https://maps.gsi.go.jp/development/ichiran.html) — 地理院標準地図・写真タイルと出典条件
- [MapLibre GL JS API](https://maplibre.org/maplibre-gl-js/docs/) — source/layer/control の標準インターフェース
