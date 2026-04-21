# 背景地図切り替え機能 品質ゲート

## 必須確認項目
- 左下の背景地図切り替えUIが表示される
- OpenStreetMap / 地理院地図 / 航空写真を選択できる
- 切り替え後、背景地図と右下出典が一致する
- 初期表示時に背景地図と出典が一致する
- 連続切り替え後も最終状態が一致する
- 読み込み失敗時に前回整合状態を維持する

## 実行コマンド
```bash
npm run test:contract
npm run test:integration
npm run test:unit
npm run build
```

## 実行記録
- 2026-04-21: `npm run quality:gates` 実行成功（contract/integration/unit/build 全通過）
