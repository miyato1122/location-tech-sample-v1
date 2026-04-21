# 背景地図切り替え機能 設計ヒアリング記録

**作成日**: 2026-04-21
**ヒアリング実施**: step4 既存情報ベースの差分ヒアリング

## ヒアリング目的

既存の要件定義・設計文書・実装コード（`main.js`）を確認し、背景地図切り替えの実装方式・UI設計について不明点を明確化するためのヒアリングを実施しました。

---

## 質問と回答

### Q1: 設計の作業規模

**質問日時**: 2026-04-21
**カテゴリ**: プロジェクト方針
**背景**: 背景地図切り替え機能は比較的シンプルな機能であり、DB・API・TypeScript型定義は不要と判断。設計規模の確認が必要。

**質問**: この設計の作業規模について教えてください
**回答**: 軽量設計

**信頼性への影響**:
- 出力ファイルを `architecture.md`、`dataflow.md`、`design-interview.md` の3ファイルに絞り込み（DBスキーマ・API仕様・型定義は不要）

---

### Q2: バックグラウンド地図の切り替え実装方式

**質問日時**: 2026-04-21
**カテゴリ**: アーキテクチャ/技術選択
**背景**: MapLibre GL JS で背景地図を切り替える方法として主に2つのアプローチがある。「3ソース初期定義（visibility 切り替え）」は安全だがメモリを多く使用し、「動的ソース切り替え（removeSource/addSource）」はメモリ効率が良いがレイヤー順序の管理が複雑になる。

**質問**: バックグラウンド地図の切り替え実装方式はどれがよいですか？
**回答**: 3ソース初期定義（推奨）— 3種タイルソースを初期スタイルに全て定義し、`setLayoutProperty` で `visibility` を排他的に切り替える

**信頼性への影響**:
- `architecture.md` の「背景地図ソース・レイヤー構成」が 🔴 → 🔵 に向上
- `dataflow.md` の「背景地図切り替えフロー」が 🔴 → 🔵 に向上
- 実装方式が確定したことで `main.js` の変更箇所が明確化

---

## ヒアリング結果サマリー

### 確認できた事項

- 設計は軽量版（architecture.md + dataflow.md）で十分
- 実装方式は「3ソース初期定義 + visibility 切り替え」に決定
- DBスキーマ・API・TypeScript型定義は不要（クライアントサイドオンリー構成のため）

### 設計方針の決定事項

1. **ソース構成**: `osm`（既存）+ `gsi_std`（新規）+ `gsi_photo`（新規）を初期スタイルに全て定義
2. **レイヤー構成**: `osm-layer`（既存、`visibility: visible`）+ `gsi-std-layer`（新規、`visibility: none`）+ `gsi-photo-layer`（新規、`visibility: none`）
3. **切り替え制御**: `map.setLayoutProperty(layerId, 'visibility', value)` で排他切り替え
4. **UIコントロール**: `maplibregl.IControl` 実装、`bottom-left` に配置
5. **コード追加先**: 既存の `main.js` に追記、`style.css` にスタイル追記

### 残課題（実装時に検証が必要）

- `AttributionControl` が `visibility: none` のソースの attribution を表示するかどうかの挙動確認。表示する場合は `_switchBasemap` メソッド内で手動更新処理を追加する

### 信頼性レベル分布

**ヒアリング前**:
- 🔵 青信号: 4件
- 🟡 黄信号: 3件
- 🔴 赤信号: 2件

**ヒアリング後**:
- 🔵 青信号: 10件（+6）
- 🟡 黄信号: 3件（±0）
- 🔴 赤信号: 0件（-2）

---

## 関連文書

- **アーキテクチャ設計**: [architecture.md](architecture.md)
- **データフロー**: [dataflow.md](dataflow.md)
- **要件定義**: [requirements.md](../../spec/basemap-switcher/requirements.md)
