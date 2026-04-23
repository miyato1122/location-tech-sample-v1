# 背景地図切り替え機能 データフロー図

**作成日**: 2026-04-21
**関連アーキテクチャ**: [architecture.md](architecture.md)
**関連要件定義**: [requirements.md](../../spec/basemap-switcher/requirements.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実なフロー
- 🟡 **黄信号**: EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測によるフロー
- 🔴 **赤信号**: EARS要件定義書・設計文書・ユーザヒアリングにない推測によるフロー

---

## 初期化フロー 🔵

**信頼性**: 🔵 *既存 main.js 実装パターン・ユーザヒアリング（4ソース初期定義方式）より*

**関連要件**: REQ-002, REQ-005

```mermaid
sequenceDiagram
    participant B as ブラウザ
    participant M as main.js
    participant ML as MapLibre GL JS
    participant T as タイルサーバー

    B->>M: アプリ起動
    M->>ML: new maplibregl.Map({ style: { sources: [osm, gsi_std, gsi_photo, ...], layers: [...] } })
    ML-->>B: マップ初期化完了
    ML->>T: OSM タイル取得（osm-layer: visible）
    T-->>ML: タイル PNG 返却
    Note over ML: gsi-std-layer: none<br/>gsi-photo-layer: none<br/>gsi-blank-layer: none<br/>（タイル取得なし）
    M->>ML: map.addControl(new BasemapSwitcherControl(), 'bottom-left')
    ML-->>B: コントロール DOM を left-bottom に挿入
```

---

## 背景地図切り替えフロー 🔵

**信頼性**: 🔵 *ユーザヒアリング（4ソース初期定義方式）・REQ-001〜005より*

**関連要件**: REQ-001, REQ-002, REQ-003, REQ-004, REQ-005

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as BasemapSwitcherControl
    participant ML as MapLibre GL JS
    participant T as タイルサーバー（GSI）

    U->>C: アイコンボタンをクリック
    C-->>U: 選択メニューを表示（OSM/地理院地図/航空写真/白地図）
    U->>C: 「地理院地図」を選択
    C->>ML: setLayoutProperty('osm-layer', 'visibility', 'none')
    C->>ML: setLayoutProperty('gsi-std-layer', 'visibility', 'visible')
    C->>ML: setLayoutProperty('gsi-photo-layer', 'visibility', 'none')
    C-->>U: メニューを閉じる（選択中アイテムにactiveクラス付与）
    ML->>T: 地理院標準地図タイル取得リクエスト
    T-->>ML: タイル PNG 返却
    ML-->>U: 地図を地理院地図で再描画
    Note over ML: ハザードマップ・避難場所レイヤーは変更なし
```

---

## コントロールUI状態遷移 🔵

**信頼性**: 🔵 *REQ-001・ユーザヒアリング（アイコンボタン形式）より*

```mermaid
stateDiagram-v2
    [*] --> 格納状態: コントロール初期化
    格納状態: 格納状態\n（メニュー非表示）
    展開状態: 展開状態\n（メニュー表示）

    格納状態 --> 展開状態: アイコンボタンクリック
    展開状態 --> 格納状態: アイコンボタン再クリック
    展開状態 --> 格納状態: 地図項目を選択
    展開状態 --> 格納状態: 地図エリアをクリック
```

---

## レイヤー可視状態管理フロー 🔵

**信頼性**: 🔵 *ユーザヒアリング（4ソース初期定義方式）・REQ-005より*

```mermaid
flowchart TD
    A[ユーザーが背景地図を選択] --> B{選択した地図}
    B -->|OSM| C[osm-layer: visible\ngsi-std-layer: none\ngsi-photo-layer: none\ngsi-blank-layer: none]
    B -->|地理院地図| D[osm-layer: none\ngsi-std-layer: visible\ngsi-photo-layer: none\ngsi-blank-layer: none]
    B -->|航空写真| E[osm-layer: none\ngsi-std-layer: none\ngsi-photo-layer: visible\ngsi-blank-layer: none]
    B -->|白地図| F[osm-layer: none\ngsi-std-layer: none\ngsi-photo-layer: none\ngsi-blank-layer: visible]
    C --> G[ハザード/避難場所レイヤーは変更なし]
    D --> G
    E --> G
    F --> G
    G --> H[MapLibre GL JS が地図を再描画]
```

---

## タイル取得フロー 🟡

**信頼性**: 🟡 *MapLibre GL JS の内部動作から妥当な推測*

MapLibre GL JS は `visibility: 'visible'` のレイヤーに対してのみタイルを取得する。

```mermaid
flowchart LR
    ML[MapLibre GL JS] -->|visibility: visible| OSM[OSM タイルサーバー\nhttps://tile.openstreetmap.org/]
    ML -->|visibility: visible| GSI_STD[地理院タイルサーバー\ncyberjapandata.gsi.go.jp/std/]
    ML -->|visibility: visible| GSI_PHOTO[地理院タイルサーバー\ncyberjapandata.gsi.go.jp/seamlessphoto/]
    ML -->|visibility: visible| GSI_BLANK[地理院タイルサーバー\ncyberjapandata.gsi.go.jp/blank/]
    ML -.-|visibility: none\n（取得しない）| INACTIVE[非アクティブソース]
```

---

## 出典表示（Attribution）更新フロー 🟡

**信頼性**: 🟡 *MapLibre GL JS の AttributionControl 動作から妥当な推測。実装時に検証が必要*

**注意**: MapLibre GL JS の `AttributionControl` はソースの `visibility` ではなく、ソースの存在を基準に attribution を収集する場合がある。4ソース全てが初期スタイルに存在するため、複数の attribution が常に表示される可能性がある。

```mermaid
flowchart TD
    A[背景地図切り替え] --> B{AttributionControl の挙動}
    B -->|自動更新の場合| C[表示中レイヤーの出典のみ表示\n✅ 実装簡素]
    B -->|常時表示の場合| D[4ソースの出典が常時表示\n⚠️ 手動更新が必要]
    D --> E[_switchBasemap 内で\n手動 attribution 更新処理を追加]
```

**対応方針**: 実装時に `AttributionControl` の挙動を検証し、必要であれば `_switchBasemap` メソッド内でカスタム attribution 更新処理を追加する。

---

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **ヒアリング記録**: [design-interview.md](design-interview.md)
- **要件定義**: [requirements.md](../../spec/basemap-switcher/requirements.md)

---

## 信頼性レベルサマリー

- 🔵 青信号: 4件（67%）
- 🟡 黄信号: 2件（33%）
- 🔴 赤信号: 0件（0%）

**品質評価**: ✅ 高品質（🟡項目は実装時の検証ポイントとして管理）
