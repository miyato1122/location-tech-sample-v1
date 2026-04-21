# データモデル: 背景地図切り替えと出典連動表示

## Entity: 背景地図種別 (BasemapType)
- 説明: 背景地図の選択値を表す列挙。
- 値:
  - `osm`
  - `gsi_std`
  - `gsi_ortho`
- 制約:
  - 未定義値は受け付けない。
  - 画面表示中の背景地図種別は常に1つ。

## Entity: 出典マッピング (AttributionMap)
- 説明: 背景地図種別と右下出典文言の対応関係。
- フィールド:
  - `basemapType` (BasemapType)
  - `attributionText` (string)
- 制約:
  - すべての BasemapType に1件以上の出典文言を必須とする。
  - マッピングは重複キーを禁止。

## Entity: 表示状態 (MapDisplayState)
- 説明: 現在画面で利用者が見ている背景地図と出典の組。
- フィールド:
  - `activeBasemap` (BasemapType)
  - `activeAttribution` (string)
  - `lastUpdatedAt` (datetime-like; 実装依存)
- 制約:
  - `activeAttribution` は `activeBasemap` に対応した文言であること。
  - 切り替え完了後に不一致状態を許容しない。

## 状態遷移
1. 初期化:
   - 既定 `BasemapType` を決定
   - 対応出典を設定
   - `MapDisplayState` を確定
2. 切り替え要求:
   - 入力 basemapType を検証
   - 背景地図更新
   - 成功時に出典更新
3. 失敗処理:
   - 更新失敗時は前回の `MapDisplayState` を維持

## 検証ルール
- Rule-01: 切り替え後は `activeBasemap` と `activeAttribution` が対応表で一致すること。
- Rule-02: 初期表示時にも Rule-01 を満たすこと。
- Rule-03: 連続切り替えの最終状態で Rule-01 を満たすこと。
