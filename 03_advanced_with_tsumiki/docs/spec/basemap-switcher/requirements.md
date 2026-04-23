# 背景地図切り替え機能 要件定義書（逆生成）

**分析日時**: 2026-04-21
**対象コードベース**: `03_advanced_with_tsumiki/main.js`、`03_advanced_with_tsumiki/style.css`
**抽出要件数**: 機能要件 9件、非機能要件 5件
**信頼度**: 高（全機能が実装済みであり、実装から直接抽出）

## 概要

地図画面の左下に背景地図切り替えパネルを常時表示し、OpenStreetMap・国土地理院地図・国土地理院航空写真・国土地理院白地図の4種類の背景地図をラジオボタンで切り替えられる機能。
既存のハザードマップ・避難場所レイヤーを維持したまま背景地図のみを切り替える。

## 関連文書

- **ヒアリング記録**: [💬 interview-record.md](interview-record.md)
- **コンテキストノート**: [📝 note.md](note.md)
- **ユーザーストーリー**: [📖 user-stories.md](user-stories.md)
- **受け入れ基準**: [✅ acceptance-criteria.md](acceptance-criteria.md)

---

## 機能要件（EARS記法）

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 実装から直接確認できる確実な要件
- 🟡 **黄信号**: 実装から妥当な推測による要件
- 🔴 **赤信号**: 実装にない推測による要件

### 通常要件

- **REQ-001**: システムは地図の左下（`bottom-left`）に背景地図切り替えパネルを常時表示しなければならない 🔵
  - **実装根拠**: `map.addControl(new BasemapSwitcherControl(), 'bottom-left')` — `main.js:548`

- **REQ-002**: 切り替えパネルはラジオボタン形式で、OSM・地理院地図・航空写真・白地図の4選択肢を縦に並べて表示しなければならない 🔵
  - **実装根拠**: `_buildUI()` が `<label>` + `<input type="radio" name="basemap">` を生成 — `main.js:484-500`

- **REQ-003**: 初期状態では OpenStreetMap が選択済み（`checked`）でなければならない 🔵
  - **実装根拠**: `this._currentBasemap = 'osm'` かつ `radio.checked = id === this._currentBasemap` — `main.js:463, 493`

- **REQ-004**: ユーザーがラジオボタンを選択すると、即座に背景地図レイヤーの表示が切り替わらなければならない 🔵
  - **実装根拠**: `radio.addEventListener('change', () => this._switchBasemap(id))` — `main.js:494`

### 条件付き要件

- **REQ-101**: 現在選択中の背景地図と同じ選択肢を選んだ場合、システムは何もしてはならない（ガード節） 🔵
  - **実装根拠**: `if (id === this._currentBasemap) return;` — `main.js:503`

- **REQ-102**: 背景地図を切り替える際、システムはまずすべての背景地図レイヤーを非表示にしてから、選択した背景地図レイヤーのみを表示しなければならない 🔵
  - **実装根拠**: 全レイヤー `visibility: 'none'` → 対象レイヤー `visibility: 'visible'` の順序 — `main.js:505-512`

- **REQ-103**: 選択した背景地図 ID に対応するレイヤーが存在しない場合、システムは切り替え処理を中断しなければならない 🔵
  - **実装根拠**: `const target = this._basemaps.find((b) => b.id === id); if (target) { ... }` — `main.js:509-513`

### 制約要件

- **REQ-401**: 4種類の背景地図ソース（osm・gsi_std・gsi_photo・gsi_blank）はマップ初期化時にすべてスタイル定義に含めなければならない 🔵
  - **実装根拠**: `style.sources` に4ソース定義済み — `main.js:26-58`

- **REQ-402**: 背景地図切り替えコントロールは `MapLibre GL JS` の `IControl` インターフェース（`onAdd(map)` / `onRemove()` メソッド）を実装しなければならない 🔵
  - **実装根拠**: `BasemapSwitcherControl` クラスの `onAdd` / `onRemove` — `main.js:471-482`

---

## 非機能要件

### UI・アクセシビリティ

- **NFR-001**: 切り替えパネルは既存の MapLibre GL JS コントロールと同じ CSS クラス（`maplibregl-ctrl maplibregl-ctrl-group`）を持ち、視覚的に統一されなければならない 🔵
  - **実装根拠**: `this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group basemap-switcher'` — `main.js:474`

- **NFR-002**: ラジオボタンのアクセントカラーは `#1a73e8`（Google Blue）でなければならない 🔵
  - **実装根拠**: `accent-color: #1a73e8` — `style.css`

- **NFR-003**: 各選択肢のラベルはラジオボタンと横並びで表示され、クリック領域が `<label>` 要素全体に及ばなければならない 🔵
  - **実装根拠**: `display: flex; align-items: center; gap: 6px` かつ `<label>` で radio を囲む — `style.css`, `main.js:486`

### 出典表示

- **NFR-004**: 背景地図の出典（attribution）は MapLibre GL JS の `AttributionControl` によって自動管理され、手動更新は行わない 🔵
  - **実装根拠**: 各ソース定義に `attribution` プロパティを設定済み、`_switchBasemap` に手動attribution更新処理なし — `main.js:31-49`

### レイヤー独立性

- **NFR-005**: 背景地図の切り替えはハザードマップ・避難場所レイヤーの visibility に一切影響を与えてはならない 🔵
  - **実装根拠**: `_switchBasemap` が操作するのは `this._basemaps` 配列内のレイヤーIDのみ — `main.js:505-507`

---

## Edgeケース

### エラー処理

- **EDGE-001**: ネットワーク障害で選択した背景地図タイルが取得できない場合、MapLibre GL JS の標準エラーハンドリングに委ねる（アプリ側の追加処理なし） 🟡
  - **推定根拠**: `_switchBasemap` にネットワークエラーハンドリングの実装がないことを確認

### 境界値

- **EDGE-101**: 同一ページに複数の `BasemapSwitcherControl` インスタンスが存在する場合、`name="basemap"` ラジオグループが干渉する可能性がある 🟡
  - **推定根拠**: `radio.name = 'basemap'` が固定値 — 本アプリは単一インスタンスのため現状問題なし

---

## 推定されていない要件・確認が必要な点

1. **ズームレベル制約**: 地理院航空写真の `maxzoom: 18` を超えたズームでの挙動は MapLibre GL JS の標準動作（タイル未取得）に依存
2. **PWA オフライン対応**: 背景地図タイルのキャッシュ戦略は未定義
3. **ラジオボタンのフォーカス・キーボード操作**: `<input type="radio">` のブラウザ標準動作に依存（明示的なキーボードテストなし）
