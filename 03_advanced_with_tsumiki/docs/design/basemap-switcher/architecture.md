# 背景地図切り替え機能 アーキテクチャ設計

**作成日**: 2026-04-21
**関連要件定義**: [requirements.md](../../spec/basemap-switcher/requirements.md)
**ヒアリング記録**: [design-interview.md](design-interview.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実な設計
- 🟡 **黄信号**: EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測による設計
- 🔴 **赤信号**: EARS要件定義書・設計文書・ユーザヒアリングにない推測による設計

---

## システム概要 🔵

**信頼性**: 🔵 *要件定義書・ユーザヒアリングより*

地図画面左下にカスタムコントロールを配置し、OpenStreetMap・国土地理院地図・国土地理院航空写真・国土地理院白地図の4種類の背景地図をユーザーが切り替えられるようにする。既存の防災マップ（`main.js`）に最小限の変更で統合する。

---

## アーキテクチャパターン 🔵

**信頼性**: 🔵 *既存アーキテクチャ・ユーザヒアリング（実装方式選択）より*

- **パターン**: MapLibre GL JS カスタムコントロール（`IControl` 実装）
- **選択理由**: 既存のコントロール（GeolocateControl, TerrainControl 等）と同じ仕組みで実装し、UIの一貫性と保守性を確保する。

---

## コンポーネント構成

### 実装ファイル 🔵

**信頼性**: 🔵 *既存プロジェクト構造より*

既存の単一ファイル構成（`main.js`）に追記する形で実装する。

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `main.js` | 追記 | ソース定義追加・レイヤー定義追加・コントロールクラス追加・コントロール登録 |
| `style.css` | 追記 | コントロール UI のスタイル定義 |

### BasemapSwitcherControl クラス 🔵

**信頼性**: 🔵 *ユーザヒアリング（実装方式）・MapLibre GL JS IControl 仕様より*

`maplibregl.IControl` インターフェースを実装するカスタムコントロールクラス。

```
BasemapSwitcherControl
├── onAdd(map): HTMLElement     // コントロールのDOM要素を生成・返却
├── onRemove()                  // DOM要素をDOMツリーから除去
├── _buildUI()                  // アイコンボタン・選択メニューを生成
├── _toggle()                   // メニューの表示/非表示を切り替え
└── _switchBasemap(id)          // 背景地図を切り替える
```

---

## 背景地図ソース・レイヤー構成 🔵

**信頼性**: 🔵 *ユーザヒアリング（4ソース初期定義方式）より*

### 追加するソース

| ソースID | タイルURL | 形式 | 最大ズーム | 出典 |
|---------|----------|------|-----------|------|
| `gsi_std` | `https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png` | PNG | 18 | 国土地理院 |
| `gsi_photo` | `https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg` | JPEG | 18 | 国土地理院 |
| `gsi_blank` | `https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png` | PNG | 14 | 国土地理院 |

### 変更するソース

| ソースID | 変更内容 |
|---------|---------|
| `osm`（既存） | `attribution` は既存のまま維持 |

### 追加するレイヤー

| レイヤーID | ソース | 初期 visibility | 挿入位置 |
|-----------|-------|----------------|---------|
| `gsi-std-layer` | `gsi_std` | `none` | `osm-layer` の直後（`hazard_flood` レイヤーの直前）|
| `gsi-photo-layer` | `gsi_photo` | `none` | `gsi-std-layer` の直後 |
| `gsi-blank-layer` | `gsi_blank` | `none` | `gsi-photo-layer` の直後 |

### 変更するレイヤー

| レイヤーID | 変更内容 |
|-----------|---------|
| `osm-layer`（既存） | `layout.visibility: 'visible'` を明示的に追加 |

---

## 切り替え制御ロジック 🔵

**信頼性**: 🔵 *ユーザヒアリング（4ソース初期定義方式）・REQ-005より*

背景地図の切り替えは、4つの背景レイヤーの `visibility` を排他的に切り替えることで実現する。ハザードマップ・避難場所レイヤーは変更しない。

```
切り替え時の処理:
1. 4つの背景レイヤーをすべて visibility: 'none' に設定
2. 選択された背景レイヤーのみ visibility: 'visible' に設定
```

| 操作 | `osm-layer` | `gsi-std-layer` | `gsi-photo-layer` | `gsi-blank-layer` |
|-----|------------|----------------|------------------|------------------|
| OSM 選択 | visible | none | none | none |
| 地理院地図 選択 | none | visible | none | none |
| 航空写真 選択 | none | none | visible | none |
| 白地図 選択 | none | none | none | visible |

---

## UIコンポーネント構成 🔵

**信頼性**: 🔵 *ユーザヒアリング（アイコンボタン形式）・REQ-001より*

### DOM構造

```html
<!-- maplibregl-ctrl は MapLibre GL JS のスタイルが自動適用される -->
<div class="maplibregl-ctrl maplibregl-ctrl-group basemap-switcher">
  <!-- アイコンボタン（常時表示） -->
  <button class="basemap-switcher-toggle" aria-label="背景地図を切り替える">
    🗺
  </button>
  <!-- 選択メニュー（クリックで展開/格納） -->
  <div class="basemap-switcher-menu" hidden>
    <button class="basemap-switcher-item active" data-id="osm">
      OSM
    </button>
    <button class="basemap-switcher-item" data-id="gsi_std">
      地理院地図
    </button>
    <button class="basemap-switcher-item" data-id="gsi_photo">
      航空写真
    </button>
    <button class="basemap-switcher-item" data-id="gsi_blank">
      白地図
    </button>
  </div>
</div>
```

### コントロール配置 🔵

**信頼性**: 🔵 *REQ-001（左下配置）・既存コントロール配置より*

```javascript
map.addControl(new BasemapSwitcherControl(), 'bottom-left');
```

| コントロール | 配置位置 |
|------------|---------|
| 既存: OpacityControl (ハザード) | `top-left` |
| 既存: OpacityControl (避難場所) | `top-right` |
| 既存: GeolocateControl | `bottom-right` |
| **新規: BasemapSwitcherControl** | **`bottom-left`** |
| 既存: TerrainControl | `bottom-right` |

---

## 出典表示（Attribution）🔵

**信頼性**: 🔵 *ユーザヒアリング（MapLibre attributionControl 自動更新）・REQ-004より*

MapLibre GL JS の デフォルト `AttributionControl` は、現在表示中のソースの `attribution` 属性を自動的に収集して表示する。ソースの visibility を切り替えると、表示されている背景地図の出典のみが表示される仕組みになる。

**注意**: MapLibre の `AttributionControl` は visibility ではなく、ソースが地図に存在するかどうかで attribution を表示する。3ソース方式では3つの attribution が常に表示される可能性があるため、背景地図 attribution については手動更新が必要になる場合がある。この点は実装時に検証すること。 🟡

---

## 技術的制約 🔵

**信頼性**: 🔵 *architecture.md・既存実装より*

- Vanilla JavaScript（ES Modules）で実装。フレームワーク不使用
- 国土地理院タイルは認証不要（パブリック）
- 国土地理院タイルの利用規約に従い出典を表示すること
- `style.css` は現在空ファイル。新規スタイルを追記する

---

## 関連文書

- **データフロー**: [dataflow.md](dataflow.md)
- **ヒアリング記録**: [design-interview.md](design-interview.md)
- **要件定義**: [requirements.md](../../spec/basemap-switcher/requirements.md)

---

## 信頼性レベルサマリー

- 🔵 青信号: 10件（77%）
- 🟡 黄信号: 3件（23%）
- 🔴 赤信号: 0件（0%）

**品質評価**: ✅ 高品質
