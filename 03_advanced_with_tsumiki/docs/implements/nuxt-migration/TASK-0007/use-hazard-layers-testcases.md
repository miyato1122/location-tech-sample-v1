# useHazardLayers Composable テストケース定義書

**タスクID**: TASK-0007  
**機能名**: useHazardLayers composable実装  
**要件名**: nuxt-migration  
**作成日**: 2026-04-21  
**テストファイル**: `tests/unit/useHazardLayers.test.ts`

---

## 開発言語・フレームワーク

- **プログラミング言語**: TypeScript
  - **言語選択の理由**: プロジェクト全体が TypeScript strict モードで開発されており、型安全性が要件（REQ-003）
  - **テストに適した機能**: 型推論によるモック作成の安全性、`as` キャストによるモック注入
- **テストフレームワーク**: Vitest
  - **フレームワーク選択の理由**: Nuxt 4 + Vite 環境に最適化されたテストランナー。`@nuxt/test-utils` と統合済み
  - **テスト実行環境**: jsdom 環境（`environment: 'jsdom'`）。MapLibre GL JS はモックで代替
- **モックライブラリ**: Vitest 組み込み（`vi.fn()`, `vi.mock()`）
- 🔵 *note.md テスト関連情報 + TASK-0001 セットアップより確認済み*

---

## テスト共通セットアップ

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

// 【テスト前準備】: MapLibre モックインスタンスの生成
// 【環境初期化】: 各テストでクリーンなモックを使用し、テスト間の干渉を防止
let mapMock: {
  addSource: ReturnType<typeof vi.fn>
  addLayer: ReturnType<typeof vi.fn>
  addControl: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  mapMock = {
    addSource: vi.fn(),
    addLayer: vi.fn(),
    addControl: vi.fn(),
  }
})
```

🔵 *既存実装 `useHazardLayers.ts` の `watchEffect` + `isLoaded` パターン + note.md テストパターンより*

---

## 1. 正常系テストケース

### TC-001: マップロード完了時に6種のハザードレイヤーソースが追加される

- **テスト名**: マップロード完了時に6種のハザードレイヤーソースが追加される
  - **何をテストするか**: `isLoaded.value === true` かつ `map.value` が存在する場合、`HAZARD_LAYERS` の6件に対して `map.addSource` が呼ばれること
  - **期待される動作**: `watchEffect` が発火し、6つのラスタータイルソースが `map.addSource` で追加される
- **入力値**:
  - `map`: `ref(mapMock)`（モックMapInstance）
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: マップが初期化完了し、レイヤー追加が可能な状態を表現
- **期待される結果**:
  - `mapMock.addSource` が6回呼ばれる
  - **期待結果の理由**: `HAZARD_LAYERS` 配列に6件のレイヤー定義が存在し、各定義に対して1回ずつソース追加が必要
- **テストの目的**: REQ-020「6種のハザードマップをGSIタイルから追加」の基本動作確認
  - **確認ポイント**: `addSource` の呼び出し回数が正確に6回であること

```typescript
// 【テスト目的】: 6種のハザードマップソースが全て追加されることを確認
// 【テスト内容】: isLoaded=true の状態で useHazardLayers を呼び、addSource の呼び出し回数を検証
// 【期待される動作】: HAZARD_LAYERS の6件全てに対して addSource が実行される
// 🔵 REQ-020 + config/map.ts HAZARD_LAYERS定義より

// 【テストデータ準備】: mapMock と isLoaded=true を用意
const map = ref(mapMock)
const isLoaded = ref(true)

// 【実際の処理実行】: useHazardLayers composable を呼び出す
useHazardLayers(map, isLoaded)

// 【結果検証】: addSource が6回呼ばれたことを確認
// 🔵 HAZARD_LAYERS の要素数6と一致
expect(mapMock.addSource).toHaveBeenCalledTimes(6)
```

🔵 *REQ-020 + config/map.ts `HAZARD_LAYERS`（6件）+ 要件定義書 セクション2 副作用より*

---

### TC-002: マップロード完了時に6種のハザードレイヤーが追加される

- **テスト名**: マップロード完了時に6種のハザードレイヤーが追加される
  - **何をテストするか**: `isLoaded.value === true` の状態で、`map.addLayer` が6回呼ばれること
  - **期待される動作**: 6つのラスターレイヤーが追加される
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: マップが完全にロードされた正常状態
- **期待される結果**:
  - `mapMock.addLayer` が6回呼ばれる
  - **期待結果の理由**: 6種のハザードレイヤーそれぞれに1つのレイヤーが必要
- **テストの目的**: REQ-020 完了条件「6種のハザードレイヤーが追加される」の検証
  - **確認ポイント**: `addLayer` の呼び出し回数

```typescript
// 【テスト目的】: 6種のハザードレイヤーが全て追加されることを確認
// 【テスト内容】: addLayer の呼び出し回数を検証
// 【期待される動作】: 6回の addLayer 呼び出し
// 🔵 REQ-020 完了条件より

// 【検証項目】: addLayer の呼び出し回数が6
// 🔵 HAZARD_LAYERS 定義と一致
expect(mapMock.addLayer).toHaveBeenCalledTimes(6)
```

🔵 *REQ-020 完了条件 + config/map.ts HAZARD_LAYERS定義より*

---

### TC-003: 各ソースがラスタータイル形式で追加される

- **テスト名**: 各ソースがラスタータイル形式で正しいパラメータで追加される
  - **何をテストするか**: `addSource` の引数が正しいラスタータイル設定を含むこと
  - **期待される動作**: 各ソースが `type: 'raster'`, `tileSize: 256`, `attribution` 付きで追加される
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: 正常なマップ状態で、ソース追加の引数内容を詳細検証
- **期待される結果**:
  - 1番目の `addSource` 呼び出し: `('hazard_flood', { type: 'raster', tiles: [...], tileSize: 256, attribution: '...' })`
  - **期待結果の理由**: GSIラスタータイル仕様に準拠し、法的要件（NFR-401）のattributionを含む
- **テストの目的**: ソース設定の正確性確認（型・タイルサイズ・attribution）
  - **確認ポイント**: `type`, `tileSize`, `attribution`, `tiles` の各パラメータ

```typescript
// 【テスト目的】: addSource に渡されるソース設定の正確性を検証
// 【テスト内容】: 最初のレイヤー（洪水浸水想定区域）のソース設定を詳細チェック
// 【期待される動作】: raster形式、tileSize: 256、GSI attribution付きでソースが追加される
// 🔵 config/map.ts HAZARD_LAYERS[0] + NFR-401 著作権表示要件より

// 【検証項目】: sourceId が 'hazard_flood' であること
// 🔵 config/map.ts HAZARD_LAYERS[0].sourceId より
expect(mapMock.addSource).toHaveBeenCalledWith(
  'hazard_flood',
  expect.objectContaining({
    type: 'raster',
    tileSize: 256,
    tiles: [expect.stringContaining('01_flood_l2_shinsuishin_data')],
  })
)

// 【検証項目】: attribution（著作権表示）が含まれること
// 🔵 NFR-401 GSI著作権表示要件より
expect(mapMock.addSource).toHaveBeenCalledWith(
  'hazard_flood',
  expect.objectContaining({
    attribution: expect.stringContaining('disaportal.gsi.go.jp'),
  })
)
```

🔵 *config/map.ts `HAZARD_LAYERS[0]` + NFR-401 著作権表示 + 要件定義書 セクション4.2より*

---

### TC-004: 各レイヤーがデフォルト非表示（visibility: 'none'）で追加される

- **テスト名**: 各レイヤーがデフォルト非表示で追加される
  - **何をテストするか**: `addLayer` の引数に `layout: { visibility: 'none' }` が含まれること
  - **期待される動作**: 全6レイヤーが `visibility: 'none'` で追加される
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: 正常状態でレイヤーのデフォルト可視性を検証
- **期待される結果**:
  - 全ての `addLayer` 呼び出しで `layout.visibility` が `'none'`
  - **期待結果の理由**: REQ-020の要件「デフォルト `visibility: 'none'`」に準拠。初期表示パフォーマンスへの影響を最小化
- **テストの目的**: 完了条件「デフォルト `visibility: 'none'`」の検証
  - **確認ポイント**: 全6回の `addLayer` 呼び出しで `layout.visibility === 'none'`

```typescript
// 【テスト目的】: 全レイヤーがデフォルト非表示で追加されることを確認
// 【テスト内容】: addLayer の各呼び出しで visibility: 'none' が設定されていることを検証
// 【期待される動作】: 6回全ての addLayer 呼び出しに layout.visibility = 'none' が含まれる
// 🔵 REQ-020 完了条件「デフォルト visibility: 'none'」より

const addLayerCalls = mapMock.addLayer.mock.calls
addLayerCalls.forEach(([layerConfig]: [any]) => {
  // 【検証項目】: 各レイヤーの layout.visibility が 'none' であること
  // 🔵 REQ-020 完了条件 + 要件定義書 セクション4.2 レイヤー追加詳細フローより
  expect(layerConfig.layout.visibility).toBe('none')
})
```

🔵 *REQ-020 完了条件 + 要件定義書 セクション4.2 レイヤー追加詳細フローより*

---

### TC-005: 各レイヤーのraster-opacityがHAZARD_LAYERSの定義値で設定される

- **テスト名**: 各レイヤーのraster-opacityが0.7で設定される
  - **何をテストするか**: `addLayer` の `paint` プロパティに `'raster-opacity'` が設定されること
  - **期待される動作**: 全レイヤーの `raster-opacity` が `HAZARD_LAYERS` の `opacity` 値（0.7）で設定される
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: 正常状態で paint 設定の正確性を検証
- **期待される結果**:
  - 全ての `addLayer` 呼び出しで `paint['raster-opacity']` が `0.7`
  - **期待結果の理由**: `config/map.ts` の `HAZARD_LAYERS` 全件が `opacity: 0.7` で定義されている
- **テストの目的**: レイヤー描画設定の正確性確認
  - **確認ポイント**: `paint['raster-opacity']` の値

```typescript
// 【テスト目的】: raster-opacity が config 定義値と一致することを確認
// 【テスト内容】: addLayer の paint 設定を検証
// 【期待される動作】: 全レイヤーで raster-opacity: 0.7 が設定される
// 🔵 config/map.ts HAZARD_LAYERS 各要素の opacity: 0.7 より

const addLayerCalls = mapMock.addLayer.mock.calls
addLayerCalls.forEach(([layerConfig]: [any]) => {
  // 【検証項目】: raster-opacity が 0.7 であること
  // 🔵 config/map.ts HAZARD_LAYERS[*].opacity = 0.7 より
  expect(layerConfig.paint['raster-opacity']).toBe(0.7)
})
```

🔵 *config/map.ts `HAZARD_LAYERS` 定義（全件 `opacity: 0.7`）より*

---

### TC-006: 各レイヤーのIDとソースIDがHAZARD_LAYERS定義と一致する

- **テスト名**: レイヤーIDとソースIDがHAZARD_LAYERS定義と一致する
  - **何をテストするか**: `addSource` の第1引数（sourceId）と `addLayer` の `id`, `source` プロパティが `HAZARD_LAYERS` 定義と一致すること
  - **期待される動作**: 全6レイヤーのID体系が正確に設定される
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: ID命名規則の正確性を検証
- **期待される結果**:
  - sourceId: `'hazard_flood'`, `'hazard_hightide'`, `'hazard_tsunami'`, `'hazard_doseki'`, `'hazard_kyukeisha'`, `'hazard_jisuberi'`
  - layerId: `'hazard_flood-layer'`, `'hazard_hightide-layer'`, etc.
  - **期待結果の理由**: `config/map.ts` の `HAZARD_LAYERS` 定義に基づくID体系
- **テストの目的**: レイヤー識別子の正確性確認（OpacityControlとの連携に必須）
  - **確認ポイント**: sourceId と layerId の対応関係

```typescript
// 【テスト目的】: sourceId/layerId が HAZARD_LAYERS 定義と完全一致することを確認
// 【テスト内容】: addSource/addLayer の引数からID値を取得し、定義値と比較
// 【期待される動作】: 6件全てのID値が config/map.ts の定義と一致する
// 🔵 config/map.ts HAZARD_LAYERS 定義より

import { HAZARD_LAYERS } from '~/config/map'

HAZARD_LAYERS.forEach((layer, index) => {
  // 【検証項目】: addSource の sourceId
  // 🔵 config/map.ts HAZARD_LAYERS[index].sourceId より
  expect(mapMock.addSource.mock.calls[index][0]).toBe(layer.sourceId)
  
  // 【検証項目】: addLayer の id と source の対応
  // 🔵 config/map.ts HAZARD_LAYERS[index].layerId/sourceId より
  expect(mapMock.addLayer.mock.calls[index][0].id).toBe(layer.layerId)
  expect(mapMock.addLayer.mock.calls[index][0].source).toBe(layer.sourceId)
})
```

🔵 *config/map.ts `HAZARD_LAYERS` 定義（6件のsourceId/layerId）より*

---

### TC-007: OpacityControlが左上位置に追加される

- **テスト名**: OpacityControlが左上（top-left）位置に追加される
  - **何をテストするか**: `map.addControl` が `'top-left'` 引数で呼ばれること
  - **期待される動作**: OpacityControl インスタンスが `'top-left'` 位置に追加される
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: 正常なマップ状態でコントロール配置位置を検証
- **期待される結果**:
  - `mapMock.addControl` が1回呼ばれ、第2引数が `'top-left'`
  - **期待結果の理由**: REQ-021「OpacityControl を左上（position: 'top-left'）に配置」
- **テストの目的**: 完了条件「OpacityControl が左上に追加される」の検証
  - **確認ポイント**: `addControl` の第2引数が `'top-left'`

```typescript
// 【テスト目的】: OpacityControl が top-left 位置に配置されることを確認
// 【テスト内容】: addControl の呼び出し引数を検証
// 【期待される動作】: addControl が 'top-left' で呼ばれる
// 🔵 REQ-021 + 完了条件「OpacityControl が左上に追加される」より

// 【検証項目】: addControl が1回呼ばれること
// 🔵 要件定義書 セクション2 副作用3 より
expect(mapMock.addControl).toHaveBeenCalledTimes(1)

// 【検証項目】: 配置位置が 'top-left' であること
// 🔵 REQ-021「position: 'top-left'」より
expect(mapMock.addControl).toHaveBeenCalledWith(
  expect.any(Object),
  'top-left'
)
```

🔵 *REQ-021「OpacityControl を左上に配置」+ 完了条件より*

---

### TC-008: OpacityControlのbaseLayersに全6レイヤーが登録される

- **テスト名**: OpacityControlのbaseLayersに全6レイヤーのID・ラベルが登録される
  - **何をテストするか**: `OpacityControl` コンストラクタに渡される `baseLayers` オブジェクトが、`HAZARD_LAYERS` 全6件の `layerId: label` マッピングを含むこと
  - **期待される動作**: `baseLayers` が `{ 'hazard_flood-layer': '洪水浸水想定区域', ... }` の形式で6件含む
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: OpacityControlの設定内容を詳細検証
- **期待される結果**:
  - OpacityControlが `{ baseLayers: { [layerId]: label } }` で初期化される（6件のエントリ）
  - **期待結果の理由**: REQ-021「全ハザードレイヤーをひとつのコントロールに集約」
- **テストの目的**: OpacityControl設定の正確性確認
  - **確認ポイント**: `baseLayers` のキー数と各キー・値の対応

```typescript
// 【テスト目的】: OpacityControl の baseLayers が全6レイヤーを含むことを確認
// 【テスト内容】: OpacityControl コンストラクタへの引数を検証（モック経由）
// 【期待される動作】: baseLayers に6件の { layerId: label } が含まれる
// 🔵 REQ-021 + 要件定義書 セクション3 OpacityControl API制約より

// OpacityControl のモックを使い、コンストラクタ引数を検証
// 【検証項目】: baseLayers のキー数が6であること
// 🔵 HAZARD_LAYERS の要素数と一致
// 【検証項目】: 各 layerId がキーとして存在し、label が値であること
// 🔵 config/map.ts HAZARD_LAYERS 定義より
```

🔵 *REQ-021 + config/map.ts `HAZARD_LAYERS` 定義 + 要件定義書 セクション3 OpacityControl API制約より*

---

### TC-009: レイヤーのtypeがrasterで設定される

- **テスト名**: 全レイヤーのtypeがrasterで設定される
  - **何をテストするか**: `addLayer` の引数でレイヤータイプが `'raster'` であること
  - **期待される動作**: 全6レイヤーが `type: 'raster'` で追加される
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **入力データの意味**: ラスタータイルレイヤー形式の正確性を検証
- **期待される結果**:
  - 全ての `addLayer` 呼び出しで `type` が `'raster'`
  - **期待結果の理由**: GSIハザードマップデータはラスタータイル形式で提供される
- **テストの目的**: レイヤータイプ設定の正確性確認
  - **確認ポイント**: `type` プロパティ

```typescript
// 【テスト目的】: 全レイヤーが raster タイプで追加されることを確認
// 【テスト内容】: addLayer の type プロパティを検証
// 【期待される動作】: 6回全ての addLayer で type: 'raster' が設定される
// 🔵 要件定義書 セクション4.2 レイヤー追加詳細フロー + GSIタイル仕様より

const addLayerCalls = mapMock.addLayer.mock.calls
addLayerCalls.forEach(([layerConfig]: [any]) => {
  // 【検証項目】: type が 'raster' であること
  // 🔵 GSIタイル形式（ラスター）より
  expect(layerConfig.type).toBe('raster')
})
```

🔵 *要件定義書 セクション4.2 + GSIラスタータイル仕様より*

---

## 2. 異常系テストケース

### TC-010: map.valueがnullの場合、何も実行されない

- **テスト名**: map.valueがnullの場合、何も実行されない
  - **エラーケースの概要**: マップインスタンスが未初期化（null）の状態で composable が呼ばれるケース
  - **エラー処理の重要性**: マップ未初期化時に addSource/addLayer を呼ぶとランタイムエラーが発生するため、ガード処理が必須
- **入力値**:
  - `map`: `ref(null)`
  - `isLoaded`: `ref(false)`
  - **不正な理由**: マップがまだ作成されていない状態
  - **実際の発生シナリオ**: コンポーネントのセットアップ時にマップ初期化が完了していない場合
- **期待される結果**:
  - `addSource`, `addLayer`, `addControl` が一度も呼ばれない
  - **エラーメッセージの内容**: エラーメッセージは出力されない（正常な遷移状態）
  - **システムの安全性**: 例外をスローせず安全にスキップされる
- **テストの目的**: null安全性（ガード条件）の確認
  - **品質保証の観点**: マップライフサイクルの初期段階での安定動作

```typescript
// 【テスト目的】: map が null の場合にエラーが発生せず安全にスキップされることを確認
// 【テスト内容】: map=null, isLoaded=false で useHazardLayers を呼び、副作用が無いことを検証
// 【期待される動作】: watchEffect 内の早期リターンにより何も実行されない
// 🔵 要件定義書 セクション4.3 + 既存実装の watchEffect ガード条件より

const map = ref(null)
const isLoaded = ref(false)
useHazardLayers(map, isLoaded)

// 【検証項目】: addSource/addLayer/addControl が呼ばれないこと
// 🔵 既存実装 `if (!isLoaded.value || !map.value) return` より
// テスト実行時、mapMock は使用されないため呼び出し回数は 0
```

🔵 *既存実装 `if (!isLoaded.value || !map.value) return` + 要件定義書 セクション4.3より*

---

### TC-011: isLoadedがfalseの場合、何も実行されない

- **テスト名**: isLoadedがfalseの場合、レイヤー追加が実行されない
  - **エラーケースの概要**: マップインスタンスは存在するが、ロードが完了していない状態
  - **エラー処理の重要性**: マップのロード前にレイヤーを追加するとエラーになる可能性がある
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(false)`
  - **不正な理由**: マップスタイルがまだ読み込まれていない状態
  - **実際の発生シナリオ**: 大きなスタイルファイルのダウンロード中
- **期待される結果**:
  - `addSource`, `addLayer`, `addControl` が一度も呼ばれない
  - **エラーメッセージの内容**: なし（正常な待機状態）
  - **システムの安全性**: ロード完了まで安全に待機
- **テストの目的**: ロード未完了時のガード条件確認
  - **品質保証の観点**: マップライフサイクルの正しい順序制御

```typescript
// 【テスト目的】: isLoaded=false の場合に副作用が発生しないことを確認
// 【テスト内容】: map は存在するが isLoaded=false で useHazardLayers を呼ぶ
// 【期待される動作】: watchEffect 内の早期リターンにより何も実行されない
// 🔵 既存実装のガード条件 + 要件定義書 セクション4.3より

const map = ref(mapMock)
const isLoaded = ref(false)
useHazardLayers(map, isLoaded)

// 【検証項目】: addSource が呼ばれないこと
// 🔵 既存実装 `if (!isLoaded.value || !map.value) return` より
expect(mapMock.addSource).not.toHaveBeenCalled()
expect(mapMock.addLayer).not.toHaveBeenCalled()
expect(mapMock.addControl).not.toHaveBeenCalled()
```

🔵 *既存実装のガード条件 `if (!isLoaded.value || !map.value) return` より*

---

### TC-012: map.valueがnullでisLoadedがtrueの場合、何も実行されない

- **テスト名**: mapがnullでisLoadedがtrueの場合、何も実行されない
  - **エラーケースの概要**: `isLoaded` は `true` だがマップインスタンスが `null` という不整合な状態
  - **エラー処理の重要性**: 理論上は発生しにくいが、マップ破棄後のタイミング問題で起こりうる
- **入力値**:
  - `map`: `ref(null)`
  - `isLoaded`: `ref(true)`
  - **不正な理由**: マップインスタンスが存在しないのにロード完了フラグが立っている不整合状態
  - **実際の発生シナリオ**: コンポーネントのアンマウント時にマップが先に破棄された場合
- **期待される結果**:
  - 副作用が一切発生しない（例外もスローしない）
  - **システムの安全性**: `map.value` の null チェックで安全にスキップ
- **テストの目的**: 防御的プログラミングの確認（不整合状態での安全性）
  - **品質保証の観点**: エッジケースでのクラッシュ防止

```typescript
// 【テスト目的】: map=null かつ isLoaded=true の不整合状態で安全にスキップされることを確認
// 【テスト内容】: map=null, isLoaded=true で useHazardLayers を呼ぶ
// 【期待される動作】: watchEffect ガード条件で早期リターン
// 🟡 既存実装ガード条件からの妥当な推測（明示的テストケースとしては要件定義書に記載なし）

const map = ref(null)
const isLoaded = ref(true)
useHazardLayers(map, isLoaded)

// 【検証項目】: 副作用なし
// 🟡 ガード条件 `!map.value` で保護されるはず
```

🟡 *既存実装ガード条件から妥当な推測。要件定義書セクション4.3の null ケースに該当*

---

## 3. 境界値テストケース

### TC-013: isLoadedがfalseからtrueに変化した時にレイヤーが追加される（watchEffectリアクティブ動作）

- **テスト名**: isLoadedがfalseからtrueに変化した時にレイヤーが追加される
  - **境界値の意味**: `watchEffect` のリアクティブ性が正しく動作し、状態変化時にコールバックが再実行されるかの境界
  - **境界値での動作保証**: `isLoaded` の `false -> true` 遷移が正確にトリガーされること
- **入力値**:
  - 初期: `map`: `ref(mapMock)`, `isLoaded`: `ref(false)`
  - 変更: `isLoaded.value = true`
  - **境界値選択の根拠**: `watchEffect` のリアクティブ依存関係の状態遷移点
  - **実際の使用場面**: マップの初期化プロセスで `isLoaded` が `false` から `true` に変化する通常のフロー
- **期待される結果**:
  - 初期状態では副作用なし
  - `isLoaded.value = true` 後に `addSource` x 6, `addLayer` x 6, `addControl` x 1 が実行される
  - **境界での正確性**: `watchEffect` が `isLoaded` の変化を検知して再実行される
  - **一貫した動作**: `false` では何もせず、`true` で全レイヤーが追加される
- **テストの目的**: `watchEffect` リアクティブ動作の確認
  - **堅牢性の確認**: マップライフサイクルの状態遷移に追従する動作

```typescript
// 【テスト目的】: watchEffect が isLoaded の false→true 遷移を検知してレイヤー追加を実行することを確認
// 【テスト内容】: isLoaded=false で初期化後、true に変更して副作用の発生を検証
// 【期待される動作】: false 時は何もせず、true 変更後に全レイヤーが追加される
// 🟡 Vue 3 watchEffect 仕様 + 要件定義書セクション4.5 watchEffect再実行パターンより

const map = ref(mapMock)
const isLoaded = ref(false)
useHazardLayers(map, isLoaded)

// 【検証項目】: 初期状態（false）では副作用なし
expect(mapMock.addSource).not.toHaveBeenCalled()

// 【実際の処理実行】: isLoaded を true に変更
isLoaded.value = true
await nextTick()

// 【検証項目】: true 変更後にレイヤーが追加される
// 🟡 watchEffect のリアクティブ再実行を前提
expect(mapMock.addSource).toHaveBeenCalledTimes(6)
expect(mapMock.addLayer).toHaveBeenCalledTimes(6)
expect(mapMock.addControl).toHaveBeenCalledTimes(1)
```

🟡 *Vue 3 `watchEffect` 仕様から妥当な推測 + 要件定義書セクション4.5*

---

### TC-014: HAZARD_LAYERS定数の全要素がソース・レイヤーとして処理される

- **テスト名**: HAZARD_LAYERS定数の全6要素が漏れなく処理される
  - **境界値の意味**: 配列の全要素が処理されることの確認（0件や部分的な処理がないこと）
  - **境界値での動作保証**: ループ処理が配列の先頭から末尾まで正確に実行されること
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **境界値選択の根拠**: 配列全要素処理の網羅性チェック（特に最後の要素 `hazard_jisuberi` が処理されること）
  - **実際の使用場面**: 通常動作での全レイヤー登録
- **期待される結果**:
  - 6件の各 `sourceId` が全て `addSource` の引数に含まれる
  - 最初の要素 `hazard_flood` と最後の要素 `hazard_jisuberi` が確実に処理される
  - **境界での正確性**: 配列の先頭と末尾が正確に処理される
  - **一貫した動作**: 全要素が同一の処理パスを通ること
- **テストの目的**: 配列処理の網羅性確認
  - **堅牢性の確認**: off-by-one エラーがないこと

```typescript
// 【テスト目的】: HAZARD_LAYERS の全要素（先頭〜末尾）が漏れなく処理されることを確認
// 【テスト内容】: addSource の全引数から sourceId を抽出し、HAZARD_LAYERS と比較
// 【期待される動作】: 6件全ての sourceId が処理される
// 🔵 config/map.ts HAZARD_LAYERS（6件）より

const addSourceCalls = mapMock.addSource.mock.calls
const sourceIds = addSourceCalls.map(([id]: [string]) => id)

// 【検証項目】: 最初の要素が処理されること
// 🔵 HAZARD_LAYERS[0].sourceId = 'hazard_flood'
expect(sourceIds).toContain('hazard_flood')

// 【検証項目】: 最後の要素が処理されること
// 🔵 HAZARD_LAYERS[5].sourceId = 'hazard_jisuberi'
expect(sourceIds).toContain('hazard_jisuberi')

// 【検証項目】: 全6件が含まれること
// 🔵 HAZARD_LAYERS 全要素の sourceId
expect(sourceIds).toEqual([
  'hazard_flood',
  'hazard_hightide',
  'hazard_tsunami',
  'hazard_doseki',
  'hazard_kyukeisha',
  'hazard_jisuberi',
])
```

🔵 *config/map.ts `HAZARD_LAYERS` 全6件の定義より*

---

### TC-015: ソース追加とレイヤー追加の順序が一致する

- **テスト名**: ソース追加の順序とレイヤー追加の順序がHAZARD_LAYERS定義順と一致する
  - **境界値の意味**: 処理順序の正確性。MapLibre ではソース追加後にそのソースを参照するレイヤーを追加する必要がある
  - **境界値での動作保証**: `addSource(sourceId)` → `addLayer({ source: sourceId })` の対応関係が正しいこと
- **入力値**:
  - `map`: `ref(mapMock)`
  - `isLoaded`: `ref(true)`
  - **境界値選択の根拠**: MapLibre の API 制約として、未登録ソースを参照するレイヤー追加はエラーになる
  - **実際の使用場面**: 全レイヤーのソース→レイヤー追加の順序が正しいこと
- **期待される結果**:
  - 各インデックスで `addSource` と `addLayer` の参照先が一致
  - **境界での正確性**: 全6ペアの対応が正確
- **テストの目的**: MapLibre API の呼び出し順序制約の確認
  - **堅牢性の確認**: ソースとレイヤーの参照整合性

```typescript
// 【テスト目的】: addSource と addLayer の順序・対応関係が HAZARD_LAYERS 定義と一致することを確認
// 【テスト内容】: addSource の sourceId と addLayer の source プロパティの対応を検証
// 【期待される動作】: 各インデックスで sourceId が一致する
// 🟡 MapLibre API の暗黙の順序制約から妥当な推測

import { HAZARD_LAYERS } from '~/config/map'

HAZARD_LAYERS.forEach((layer, index) => {
  const sourceId = mapMock.addSource.mock.calls[index][0]
  const layerSource = mapMock.addLayer.mock.calls[index][0].source
  
  // 【検証項目】: ソースID とレイヤーの source 参照が一致
  // 🟡 MapLibre 仕様: レイヤーは追加済みソースを参照する必要がある
  expect(sourceId).toBe(layerSource)
  expect(sourceId).toBe(layer.sourceId)
})
```

🟡 *MapLibre GL JS の API 制約（ソース追加→レイヤー追加の順序）から妥当な推測*

---

## 4. 追加テストケース（実装パターン確認）

### TC-016: composableがexport constで公開されている

- **テスト名**: useHazardLayersがexport constで公開されている
  - **何をテストするか**: composable が正しくエクスポートされ、インポート可能であること
  - **期待される動作**: `import { useHazardLayers } from '~/composables/useHazardLayers'` が正常に解決される
- **入力値**: なし（モジュールインポートのテスト）
- **期待される結果**:
  - `useHazardLayers` が関数として存在する
  - `typeof useHazardLayers === 'function'`
- **テストの目的**: モジュールエクスポートの確認
  - **確認ポイント**: 名前付きエクスポートの存在

```typescript
// 【テスト目的】: useHazardLayers が正しくエクスポートされていることを確認
// 【テスト内容】: import した useHazardLayers が関数であることを検証
// 【期待される動作】: typeof が 'function' であること
// 🔵 既存実装 export const useHazardLayers = (...) => { ... } より

import { useHazardLayers } from '~/composables/useHazardLayers'
expect(typeof useHazardLayers).toBe('function')
```

🔵 *既存実装の `export const useHazardLayers` より*

---

## 5. テストケースと要件定義との対応関係

### 参照した機能概要
- 要件定義書 セクション1「機能の概要」: 6種ハザードマップレイヤー + OpacityControl

### 参照した入力・出力仕様
- 要件定義書 セクション2「入力・出力の仕様」: `map`, `isLoaded` 引数 + `void` 戻り値 + 3つの副作用

### 参照した制約条件
- 要件定義書 セクション3「制約条件」: MapInstance型、HAZARD_LAYERS定数、OpacityControl API（baseLayers）、attribution

### 参照した使用例
- 要件定義書 セクション4「想定される使用例」: 基本パターン、null ガード、watchEffect再実行

### テストケースと完了条件の対応

| 完了条件 | テストケース |
|---------|------------|
| `composables/useHazardLayers.ts` が作成されている | TC-016 |
| 6種のハザードレイヤーが追加される（デフォルト `visibility: 'none'`） | TC-001, TC-002, TC-004, TC-006, TC-014 |
| OpacityControl が左上に追加される | TC-007, TC-008 |
| マップのload完了後にレイヤーが追加される | TC-010, TC-011, TC-013 |
| TypeScript strict モードでエラーなし | TC-016（インポート・型チェック） |

---

## 6. テストケースサマリー

| テストケースID | 分類 | テスト名 | 信頼性 |
|------------|------|---------|--------|
| TC-001 | 正常系 | 6種のハザードレイヤーソースが追加される | 🔵 |
| TC-002 | 正常系 | 6種のハザードレイヤーが追加される | 🔵 |
| TC-003 | 正常系 | 各ソースがラスタータイル形式で追加される | 🔵 |
| TC-004 | 正常系 | 各レイヤーがデフォルト非表示で追加される | 🔵 |
| TC-005 | 正常系 | raster-opacityが0.7で設定される | 🔵 |
| TC-006 | 正常系 | レイヤーIDとソースIDが定義と一致する | 🔵 |
| TC-007 | 正常系 | OpacityControlが左上に追加される | 🔵 |
| TC-008 | 正常系 | baseLayersに全6レイヤーが登録される | 🔵 |
| TC-009 | 正常系 | レイヤーtypeがrasterで設定される | 🔵 |
| TC-010 | 異常系 | map.valueがnullの場合何も実行されない | 🔵 |
| TC-011 | 異常系 | isLoadedがfalseの場合何も実行されない | 🔵 |
| TC-012 | 異常系 | mapがnullでisLoadedがtrueの場合何も実行されない | 🟡 |
| TC-013 | 境界値 | isLoadedのfalse→true遷移でレイヤー追加 | 🟡 |
| TC-014 | 境界値 | 全6要素が漏れなく処理される | 🔵 |
| TC-015 | 境界値 | ソース追加とレイヤー追加の順序一致 | 🟡 |
| TC-016 | パターン | composableがexport constで公開されている | 🔵 |

---

## 信頼性レベルサマリー

| 信頼性 | 件数 | 割合 | 該当テストケース |
|--------|------|------|---------------|
| 🔵 確実 | 13件 | 81% | TC-001〜TC-011, TC-014, TC-016 |
| 🟡 推測 | 3件 | 19% | TC-012, TC-013, TC-015 |
| 🔴 根拠なし | 0件 | 0% | なし |

---

**作成者**: Claude Code  
**作成日時**: 2026-04-21
