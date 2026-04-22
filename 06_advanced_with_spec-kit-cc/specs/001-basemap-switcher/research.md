# リサーチ結果: 背景地図切り替え機能

**フィーチャー**: 001-basemap-switcher
**作成日**: 2026-04-22

## 1. MapLibre GL JS の背景レイヤー切り替えAPI

### 決定事項
`setLayoutProperty('layer-id', 'visibility', 'visible'/'none')` による可視性トグルを採用する。

### 根拠
- 初期スタイル定義に3つの背景ソースとレイヤーをすべて宣言しておき、
  切り替え時に対象レイヤーを `visible`、他を `none` に設定する方式が最もシンプル。
- `map.getSource().setTiles()` による動的差し替えより実装が少なく、
  状態管理も不要。
- 既存コードの OpacityControl が同じパターン（visibility トグル）を採用しており、
  コードの一貫性が保てる。

### 検討した代替案
| 案 | 評価 |
|----|------|
| `getSource().setTiles()` でURLを動的に差し替え | ソース定義が1つで済むが、切り替え時に地図が一時的にリセットされる可能性あり。採用せず |
| スタイル全体を `setStyle()` で差し替え | 全レイヤーの再初期化が発生し、既存オーバーレイが消える。採用せず |

---

## 2. Attribution（出典）の自動更新

### 決定事項
MapLibre GL JS の標準 AttributionControl が可視レイヤーのソース attribution を
自動収集する仕様のため、**レイヤー可視性切り替えだけで attribution も自動更新される**。
カスタム attribution 実装は不要。

### 根拠
- MapLibre GL JS の AttributionControl は、現在 visibility が `'visible'` の
  レイヤーが参照するソースの `attribution` フィールドを収集して表示する。
- レイヤーを `visibility: 'none'` に設定すると、そのソースの attribution は
  表示されなくなる。
- 追加コードなしで FR-008 の要件を満たせる。

---

## 3. タイル読み込みエラーの検知

### 決定事項
MapLibre GL JS の `map.on('error', handler)` イベントを使用する。

### 根拠
MapLibre は内部でタイル取得に失敗すると `error` イベントを発火する。
イベントオブジェクトの `sourceId` で対象ソースを特定できる。
背景地図ソース（`osm`, `gsi-std`, `gsi-photo`）のエラー時のみメッセージを表示する。

### エラーメッセージの表示方法
地図コンテナ上に重ねた `<div>` 要素を一定時間表示後に非表示にする
（CSS クラスの追加・削除で制御）。

---

## 4. ラジオボタンコントロールの実装方法

### 決定事項
MapLibre コントロールクラスを実装せず、**`index.html` に直接 `<div>` 要素を配置**して
CSS で `position: absolute; bottom: 40px; left: 10px` に固定する方針を採用する。

### 根拠
- 仕様書でラジオボタン（HTML標準）を採用と確定しているため、
  MapLibre の `addControl()` API に組み込む必要はない。
- `position: absolute` で配置する方が、既存 CSS との干渉が少なく、
  OpacityControl（left-top）・避難場所コントロール（right-top）と
  位置が重ならない `bottom-left` を確保できる。
- 実装コードが最小になる。

### 注意事項
- MapLibre のズームコントロールは `bottom-right` に表示されることがある。
  ラジオボタンは `bottom: 40px; left: 10px` とし重複を避ける。

---

## 5. 国土地理院タイルの仕様

| 地図種別 | タイルURL | 最大ズーム | タイルサイズ | フォーマット |
|---------|----------|-----------|------------|------------|
| 地理院地図（標準） | `https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png` | 18 | 256px | PNG |
| 航空写真 | `https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg` | 18 | 256px | JPEG |

Attribution 文字列:
- 地理院地図: `<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>`
- 航空写真: `<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>`
