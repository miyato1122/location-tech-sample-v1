# 修正計画

**作成日時**: 20260423104816
**修正概要**: 背景地図切り替えパネルを縦並びにし、国土地理院白地図を最後尾に追加する
**修正種別**: 複合（コード＋ドキュメント等）

---

## 修正対象ファイル

| ファイル | 該当行 | 内容 |
|---------|--------|------|
| `main.js` | L43-50 | `gsi_blank` ソース追加（国土地理院白地図タイル） |
| `main.js` | L160-161 | `gsi-blank-layer` レイヤー追加 |
| `main.js` | L464-468 | `_basemaps` 配列に白地図エントリ追加 |
| `style.css` | L2-5 | `.basemap-switcher` に `display:flex; flex-direction:column` 追加 |
| `docs/spec/basemap-switcher/requirements.md` | L10, L34, L56 | 3種→4種、白地図追記 |
| `docs/spec/basemap-switcher/acceptance-criteria.md` | L25, L33 | TC-001-03の4項目化、サマリー更新 |
| `docs/design/basemap-switcher/architecture.md` | L18, L107-109, L129-135 | 3種→4種、visibility テーブル・UI ツリー更新 |
| `docs/design/basemap-switcher/dataflow.md` | L53, L92-94 | mermaid ダイアグラムに白地図を追記 |

---

## 修正前後の詳細

### `main.js` — gsi_blank ソース追加

**修正前** (L43-50の後、`// 重ねるハザードマップここから` の直前):
```javascript
            gsi_photo: {
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
                maxzoom: 18,
                tileSize: 256,
                attribution:
                    '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
            },
            // 重ねるハザードマップここから
```

**修正後**:
```javascript
            gsi_photo: {
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
                maxzoom: 18,
                tileSize: 256,
                attribution:
                    '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
            },
            gsi_blank: {
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png'],
                maxzoom: 14,
                tileSize: 256,
                attribution:
                    '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
            },
            // 重ねるハザードマップここから
```

**修正理由**: 国土地理院白地図（`blank`タイル）をソースとして登録する。maxzoom は GSI 仕様に合わせ 14。

---

### `main.js` — gsi-blank-layer レイヤー追加

**修正前** (L157-163、`gsi-photo-layer` の直後):
```javascript
            {
                id: 'gsi-photo-layer',
                source: 'gsi_photo',
                type: 'raster',
                layout: { visibility: 'none' },
            },
            // 重ねるハザードマップここから
```

**修正後**:
```javascript
            {
                id: 'gsi-photo-layer',
                source: 'gsi_photo',
                type: 'raster',
                layout: { visibility: 'none' },
            },
            {
                id: 'gsi-blank-layer',
                source: 'gsi_blank',
                type: 'raster',
                layout: { visibility: 'none' },
            },
            // 重ねるハザードマップここから
```

**修正理由**: `gsi_blank` ソースを描画するレイヤーを背景地図グループの末尾に追加する。

---

### `main.js` — `_basemaps` 配列に白地図エントリ追加

**修正前** (L464-468):
```javascript
        this._basemaps = [
            { id: 'osm',       layerId: 'osm-layer',       label: 'OSM' },
            { id: 'gsi_std',   layerId: 'gsi-std-layer',   label: '地理院地図' },
            { id: 'gsi_photo', layerId: 'gsi-photo-layer', label: '航空写真' },
        ];
```

**修正後**:
```javascript
        this._basemaps = [
            { id: 'osm',       layerId: 'osm-layer',       label: 'OSM' },
            { id: 'gsi_std',   layerId: 'gsi-std-layer',   label: '地理院地図' },
            { id: 'gsi_photo', layerId: 'gsi-photo-layer', label: '航空写真' },
            { id: 'gsi_blank', layerId: 'gsi-blank-layer', label: '白地図' },
        ];
```

**修正理由**: 切り替え対象として白地図を最後尾に追加する。`_switchBasemap` はこの配列を走査するため、エントリを追加するだけで切り替えロジックに変更不要。

---

### `style.css` — `.basemap-switcher` 縦並び化

**修正前** (L1-5):
```css
/* 背景地図切り替えコントロール */
.basemap-switcher {
    background: #fff;
    padding: 4px 8px;
}
```

**修正後**:
```css
/* 背景地図切り替えコントロール */
.basemap-switcher {
    background: #fff;
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
}
```

**修正理由**: `.maplibregl-ctrl-group` が flex row を継承する場合に備え、コンテナを明示的に `flex-direction: column` とすることで選択肢を縦並びに固定する。

---

### `docs/spec/basemap-switcher/requirements.md` — 3種→4種・白地図追記

**修正前** (L10):
```
地図画面の左下に背景地図切り替えパネルを常時表示し、OpenStreetMap・国土地理院地図・国土地理院航空写真の3種類の背景地図をラジオボタンで切り替えられる機能。
```

**修正後**:
```
地図画面の左下に背景地図切り替えパネルを常時表示し、OpenStreetMap・国土地理院地図・国土地理院航空写真・国土地理院白地図の4種類の背景地図をラジオボタンで切り替えられる機能。
```

**修正前** (L34、REQ-002):
```
- **REQ-002**: 切り替えパネルはラジオボタン形式で、OSM・地理院地図・航空写真の3選択肢を縦に並べて表示しなければならない 🔵
```

**修正後**:
```
- **REQ-002**: 切り替えパネルはラジオボタン形式で、OSM・地理院地図・航空写真・白地図の4選択肢を縦に並べて表示しなければならない 🔵
```

**修正前** (L56、REQ-401):
```
- **REQ-401**: 3種類の背景地図ソース（osm・gsi_std・gsi_photo）はマップ初期化時にすべてスタイル定義に含めなければならない 🔵
  - **実装根拠**: `style.sources` に3ソース定義済み — `main.js:26-50`
```

**修正後**:
```
- **REQ-401**: 4種類の背景地図ソース（osm・gsi_std・gsi_photo・gsi_blank）はマップ初期化時にすべてスタイル定義に含めなければならない 🔵
  - **実装根拠**: `style.sources` に4ソース定義済み — `main.js:26-58`
```

**修正理由**: 白地図追加に伴い要件の種別数・ソース名を更新する。

---

### `docs/spec/basemap-switcher/acceptance-criteria.md` — 4項目化・サマリー更新

**修正前** (L25):
```
- 地図の左下に「OSM」「地理院地図」「航空写真」のラジオボタンが縦に並んで表示される
```

**修正後**:
```
- 地図の左下に「OSM」「地理院地図」「航空写真」「白地図」のラジオボタンが縦に並んで表示される
```

**修正前** (L33):
```
- [x] **TC-001-03**: パネルに「OSM」「地理院地図」「航空写真」の3項目が表示される 🔵
```

**修正後**:
```
- [x] **TC-001-03**: パネルに「OSM」「地理院地図」「航空写真」「白地図」の4項目が表示される 🔵
```

TC-004 ブロックの末尾（L57の後）に追記:
```
- [x] **TC-004-05**: OSM → 白地図 に切り替えできる 🔵
- [x] **TC-004-06**: 白地図 → OSM に切り替えできる（一巡） 🔵
```

テストケースサマリーテーブルの機能要件行（L153）:
- 実装済み: 10件 → 12件
- 合計: 11件 → 13件
- 合計行: 14件 → 16件

**修正理由**: 白地図切り替えテストケースを追加し、サマリーを正確に更新する。

---

### `docs/design/basemap-switcher/architecture.md` — 3種→4種・テーブル・UIツリー更新

**修正前** (L18):
```
地図画面左下にカスタムコントロールを配置し、OpenStreetMap・国土地理院地図・国土地理院航空写真の3種類の背景地図をユーザーが切り替えられるようにする。
```

**修正後**:
```
地図画面左下にカスタムコントロールを配置し、OpenStreetMap・国土地理院地図・国土地理院航空写真・国土地理院白地図の4種類の背景地図をユーザーが切り替えられるようにする。
```

**修正前** (L107-109、visibility テーブル):
```
| OSM 選択     | visible | none    | none        |
| 地理院地図 選択 | none    | visible | none        |
| 航空写真 選択  | none    | none    | visible     |
```
（テーブルヘッダーも `osm-layer | gsi-std-layer | gsi-photo-layer` の3列）

**修正後**:
```
| OSM 選択      | visible | none    | none          | none    |
| 地理院地図 選択 | none    | visible | none          | none    |
| 航空写真 選択  | none    | none    | visible       | none    |
| 白地図 選択    | none    | none    | none          | visible |
```
（ヘッダーに `gsi-blank-layer` 列を追加）

**修正前** (L129-135、UIツリー部分):
```
      OSM
      ...
      地理院地図
      ...
      航空写真
```

**修正後**: `航空写真` の後に `白地図` エントリを追加。

**修正理由**: 設計文書に4種類の状態遷移テーブルとUIツリーを反映する。

---

### `docs/design/basemap-switcher/dataflow.md` — mermaid ダイアグラム更新

**修正前** (L53):
```
    C-->>U: 選択メニューを表示（OSM/地理院地図/航空写真）
```

**修正後**:
```
    C-->>U: 選択メニューを表示（OSM/地理院地図/航空写真/白地図）
```

**修正前** (L92-94):
```
    B -->|OSM| C[osm-layer: visible\ngsi-std-layer: none\ngsi-photo-layer: none]
    B -->|地理院地図| D[osm-layer: none\ngsi-std-layer: visible\ngsi-photo-layer: none]
    B -->|航空写真| E[osm-layer: none\ngsi-std-layer: none\ngsi-photo-layer: visible]
```

**修正後**:
```
    B -->|OSM| C[osm-layer: visible\ngsi-std-layer: none\ngsi-photo-layer: none\ngsi-blank-layer: none]
    B -->|地理院地図| D[osm-layer: none\ngsi-std-layer: visible\ngsi-photo-layer: none\ngsi-blank-layer: none]
    B -->|航空写真| E[osm-layer: none\ngsi-std-layer: none\ngsi-photo-layer: visible\ngsi-blank-layer: none]
    B -->|白地図| F[osm-layer: none\ngsi-std-layer: none\ngsi-photo-layer: none\ngsi-blank-layer: visible]
```

**修正理由**: データフロー図に白地図の分岐を追加し、全状態を網羅する。

---

## 影響範囲

### 影響を受けるファイル

| ファイル | 影響の種類 | 対応要否 |
|---------|-----------|---------|
| `dist/assets/index.843f5e97.js` | ビルド生成物 | 不要（再ビルドで自動更新） |
| `docs/spec/basemap-switcher/user-stories.md` | ユーザーストーリー記述 | 不要（背景地図の種類はストーリー本文に依存せず） |
| `docs/spec/basemap-switcher/note.md` | コンテキストノート | 不要（調査メモのため変更不要） |
| `docs/tasks/basemap-switcher/` | タスク定義 | 不要（完了済みタスクのため変更不要） |

### 関連テストファイル

| テストファイル | 対応内容 |
|--------------|---------|
| （basemap-switcher に専用テストファイルなし） | basemap-switcher のテストケースはドキュメント内 acceptance-criteria.md で管理 |
| `docs/spec/disaster-prevention-map/tests/*.test.js` | 変更不要（basemap-switcher と無関係） |

---

## リスク・注意事項

- 国土地理院白地図タイル（`blank`）の maxzoom は 14 であり、ズーム 15 以上では tiles が取得されず空白表示になる。MapLibre GL JS の標準動作（タイル未取得時は透明）に依存。
- `gsi-blank-layer` は背景地図グループの末尾に配置するため、`hillshade` レイヤーの挿入基準（`hazard_jisuberi-layer` の手前）には影響しない。
- ドキュメント内のテストケースサマリー数値（機能要件 10→12、合計 14→16）の更新漏れに注意。

---

## 確認手順

### ビルド確認
```
npm run build
```

### テスト実行
```
（basemap-switcher 専用テストなし。ブラウザでの動作確認を実施する）
npm run dev
```

ブラウザ確認項目:
1. 左下パネルに「OSM / 地理院地図 / 航空写真 / 白地図」が縦に並んでいること
2. 「白地図」クリックで国土地理院白地図に切り替わること
3. 白地図 → OSM / 地理院地図 / 航空写真 への切り替えが正常に動作すること
4. ハザードマップ・避難場所レイヤーが切り替え後も維持されること

### セキュリティ確認観点
- 入力値のバリデーション変更の有無: なし（ラジオボタン固定値のみ）
- 認証・認可ロジックの変更の有無: なし
- 外部入力を扱う箇所の変更の有無: なし
- SQLインジェクション・XSS等のリスクの有無: なし（外部タイルURLは定数、ユーザー入力なし）

---

*このplanファイルは `/tsumiki:refine-execute .dcs/20260423104816_refine_basemap_vertical_blank/plan.md` で実行できます*
