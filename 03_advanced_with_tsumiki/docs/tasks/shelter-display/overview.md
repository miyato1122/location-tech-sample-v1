# shelter-display タスク一覧

## 概要

**分析日時**: 2026-04-20  
**対象コードベース**: `03_advanced_with_tsumiki/main.js`, `public/skhb/`  
**発見タスク数**: 3  
**推定総工数**: 5時間

指定緊急避難場所（SKHB）の全国データをベクトルタイル形式で地図上に表示し、災害種別ごとにフィルタリングする機能。

---

## タスク一覧

### TASK-0001: ベクトルタイルデータ準備（事前処理）

- [x] **タスク完了**（実装済み）
- **タスクタイプ**: DIRECT
- **実装ファイル**:
  - `public/skhb/metadata.json`
  - `public/skhb/{z}/{x}/{y}.pbf`（ズーム5〜8）
- **実装詳細**:
  - Tippecanoe v2.9.1 で全国112,525件の施設データをPBF形式に変換
  - ズームレベル5〜8でタイル化（全国〜都道府県レベル）
  - 各フィーチャーに name, address, remarks, disaster1〜8 属性を保持
- **推定工数**: 2時間

### TASK-0002: 避難場所レイヤー定義（8種別）

- [x] **タスク完了**（実装済み）
- **タスクタイプ**: DIRECT
- **実装ファイル**:
  - `main.js:102-115`（skhb ソース定義）
  - `main.js:187-363`（skhb-1〜8 レイヤー定義）
- **実装詳細**:
  - ベクトルタイルソース `skhb` を動的URL（`location.href` ベース）で定義
  - 8種の災害種別ごとに独立したサークルレイヤーを定義
  - 各レイヤーに `filter: ['get', 'disasterN']` で対応施設のみ表示
  - ズームに応じてサークルサイズが変化（zoom5: 2px → zoom14: 6px）
  - デフォルトは全て `visibility: 'none'`
- **推定工数**: 1時間

### TASK-0003: 避難場所レイヤーコントロール（OpacityControl）

- [x] **タスク完了**（実装済み）
- **タスクタイプ**: DIRECT
- **実装ファイル**:
  - `main.js:443-455`
- **実装詳細**:
  - `maplibre-gl-opacity` プラグインで右上にコントロールを配置
  - 8種の災害種別をラベル付きで排他的に表示切り替え
  - ラベル: 洪水、崖崩れ/土石流/地滑り、高潮、地震、津波、大規模な火事、内水氾濫、火山現象
- **推定工数**: 1時間

---

## 依存関係マップ

```mermaid
graph TD
    A[TASK-0001: ベクトルタイル準備] --> B[TASK-0002: レイヤー定義]
    C[map-initialization/TASK-0001] --> B
    B --> D[TASK-0003: OpacityControl]
    B --> E[map-initialization/TASK-0002: クリックポップアップ]
    B --> F[geolocation-routing/TASK-0002: 最近傍検索]
