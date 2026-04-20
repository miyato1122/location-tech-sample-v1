# useMap composable - TDD 開発完了記録

## 確認すべきドキュメント

- `docs/implements/nuxt-migration/TASK-0006/useMap-requirements.md`
- `docs/implements/nuxt-migration/TASK-0006/useMap-testcases.md`
- `docs/implements/nuxt-migration/TASK-0006/useMap-green-phase.md`

## 🎯 最終結果 (2026-04-20)
- **実装率**: 100% (14/14 テストケース)
- **品質判定**: 合格（完全達成）
- **TODO更新**: ✅ 完了マーク追加

## 📊 テスト状況
- スコープ内: 14/14 全通過（useMap.test.ts）
- スコープ外: 4/4 全通過（types.test.ts）
- 全体: 18/18 全通過
- 実行時間: 559ms（30秒以下・良好）

## 💡 重要な技術学習

### 実装パターン
- `vi.mock('maplibre-gl')` のホイスティング制約により、実装側で `onMounted` 内の動的インポート `const { Map } = await import('maplibre-gl')` を採用する必要がある
- `vi.fn(function () { ... })` の通常関数形式でないと `new` コンストラクタとして使えないため、`MockMap` はアロー関数不可
- `MAP_INIT_CONFIG` と `UseMapReturn` を `types/index.ts` から参照することで型の一元管理を実現

### テスト設計
- `withSetup` ヘルパー関数パターン（defineComponent + mount）でcomposableをテストする手法が有効
- `flushPromises()` で動的インポートの非同期解決を待つことが必須
- `beforeEach` でDOMにコンテナ要素を追加し、`afterEach` でクリーンアップする実践的なセットアップ

### 品質保証
- `as MaplibreMap` 型アサーションは現状維持（改善は任意）
- `onUnmounted` の `map.value?.remove()` でnullガードを実装し、初期化前アンマウントも安全に処理

## 要件完了条件チェック
- [x] `composables/useMap.ts` が作成されている
- [x] `onMounted` でマップが初期化される（center: [138, 37], zoom: 5, minZoom: 5, maxBounds: [122, 20, 154, 50]）
- [x] `onUnmounted` で `map.remove()` が呼ばれる
- [x] `Ref<maplibregl.Map | null>` を返す
- [x] `useMap` の単体テストがパスする（14/14）
