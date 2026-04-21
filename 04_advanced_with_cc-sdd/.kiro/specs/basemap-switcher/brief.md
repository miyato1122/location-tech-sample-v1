# Brief: basemap-switcher

## Problem
防災マップ利用者は、背景地図を文脈に応じて切り替えたいが、現状は OpenStreetMap のみで、地形把握や現地確認の解像度が不足する場面がある。結果として、避難施設やハザード情報の位置関係を理解しづらい。

## Current State
現在の実装は `main.js` の style.sources に `osm` のみを背景地図として定義し、背景レイヤーは `osm-layer` 1つで固定表示している。背景地図の切り替えUIは存在しない。

## Desired Outcome
画面左下に背景地図切り替えUIを追加し、OpenStreetMap / 地理院地図 / 航空写真の3種類を排他的に切り替えて表示できる。切り替え後も既存のハザードオーバーレイ、避難施設表示、現在地ルーティングは継続して機能する。

## Approach
MapLibre GL の raster source/layer を3系統で定義し、表示中の背景レイヤーのみ `visibility: visible`、他は `none` にする排他制御を採用する。UIは MapLibre のコントロールとして左下（`bottom-left`）に配置し、選択状態を明示する。既存の style 構造と整合し、影響範囲を背景レイヤーとコントロール実装に限定できるため、この方針を採用する。

## Scope
- **In**: 背景ソース/レイヤーの追加（地理院地図・航空写真）、左下切替UI、排他表示制御、必要な attribution 表示の見直し、既存表示機能との非回帰確認
- **Out**: ハザードレイヤー仕様変更、避難施設データ構造変更、ルーティングアルゴリズム変更、地図スタイル全面刷新、オフラインタイル配信

## Boundary Candidates
- 背景地図データ定義（source/layer と attribution）
- 背景地図切替UIとレイヤー可視性制御

## Out of Boundary
- ハザード種別コントロール（OpacityControl）の挙動変更
- 地形3D表示や標高タイルの処理変更
- PWAキャッシュ戦略の再設計

## Upstream / Downstream
- **Upstream**: MapLibre GL JS の style/layer 制約、OSM/GSI タイル利用条件、既存 `main.js` の単一エントリー構成
- **Downstream**: 将来的な背景地図プリセット追加（例: 淡色地図）、利用状況に応じたタイル配信基盤見直し

## Existing Spec Touchpoints
- **Extends**: なし（既存 `hazard-map-app` spec は境界定義が未確立のため、新規specとして分離）
- **Adjacent**: 既存マップ初期化処理（`main.js`）と表示コントロール群（OpacityControl）

## Constraints
- 現行技術（Vite + vanilla JS + MapLibre GL JS 2.x）を維持する
- UI配置は画面左下に固定する
- 各背景地図に必要な出典表示を欠落させない
- 高トラフィック運用を前提としない（OSM標準タイル利用条件に準拠）
