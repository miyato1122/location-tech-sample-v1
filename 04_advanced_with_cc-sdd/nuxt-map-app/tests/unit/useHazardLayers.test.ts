/**
 * useHazardLayers composable ユニットテスト
 *
 * TDD Redフェーズ: 失敗するテストケースの実装
 *
 * 【テスト対象】: composables/useHazardLayers.ts
 * 【テスト環境】: Vitest + jsdom
 * 【モック方針】: MapLibre GL JS と maplibre-gl-opacity を vi.mock() でモック化
 * 【作成日】: 2026-04-21
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'

// ------------------------------------------------------------------
// モック設定
// ------------------------------------------------------------------

// maplibre-gl-opacity を vi.mock() でモック化
// OpacityControl のコンストラクタ引数を検証できるようにする
const MockOpacityControl = vi.fn().mockImplementation((options: { baseLayers: Record<string, string> }) => {
  return {
    _options: options,
    onAdd: vi.fn(),
    onRemove: vi.fn(),
  }
})

vi.mock('maplibre-gl-opacity', () => ({
  default: MockOpacityControl,
}))

// ------------------------------------------------------------------
// テスト共通セットアップ
// ------------------------------------------------------------------

/**
 * MapLibre Map インスタンスのモック型
 * 実際の MapInstance インターフェースに準拠したモックを定義
 */
type MapMockType = {
  on: ReturnType<typeof vi.fn>
  addSource: ReturnType<typeof vi.fn>
  addLayer: ReturnType<typeof vi.fn>
  addControl: ReturnType<typeof vi.fn>
  getStyle: ReturnType<typeof vi.fn>
  getZoom: ReturnType<typeof vi.fn>
  getCanvas: ReturnType<typeof vi.fn>
  getSource: ReturnType<typeof vi.fn>
  queryRenderedFeatures: ReturnType<typeof vi.fn>
  querySourceFeatures: ReturnType<typeof vi.fn>
  loaded: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
}

let mapMock: MapMockType

beforeEach(() => {
  // 【テスト前準備】: 各テスト実行前に MapLibre モックインスタンスを初期化
  // 【環境初期化】: 前のテストの呼び出し履歴をリセットし、テスト間の干渉を防止
  mapMock = {
    on: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    addControl: vi.fn(),
    getStyle: vi.fn(),
    getZoom: vi.fn(),
    getCanvas: vi.fn(),
    getSource: vi.fn(),
    queryRenderedFeatures: vi.fn(),
    querySourceFeatures: vi.fn(),
    loaded: vi.fn(),
    remove: vi.fn(),
  }
  // OpacityControl モックの呼び出し履歴もリセット
  MockOpacityControl.mockClear()
})

afterEach(() => {
  // 【テスト後処理】: vi.mock のスパイをリセットして次のテストへの影響を防止
  vi.clearAllMocks()
})

// ------------------------------------------------------------------
// テスト本体
// ------------------------------------------------------------------

describe('useHazardLayers', () => {
  // ----------------------------------------------------------------
  // 1. 正常系テストケース
  // ----------------------------------------------------------------

  describe('正常系: マップロード完了時のレイヤー追加', () => {
    it('TC-001: マップロード完了時に6種のハザードレイヤーソースが追加される', async () => {
      // 【テスト目的】: isLoaded=true かつ map が存在する場合、HAZARD_LAYERS の6件に対して addSource が呼ばれること
      // 【テスト内容】: watchEffect が発火し、6つのラスタータイルソースが map.addSource で追加される
      // 【期待される動作】: addSource が6回呼ばれる（既存実装では addSource は未実装のため失敗するはず）
      // 🔵 REQ-020 + config/map.ts HAZARD_LAYERS定義（6件）より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      // 【テストデータ準備】: マップロード完了状態（isLoaded=true）を用意
      const map = ref(mapMock)
      const isLoaded = ref(true)

      // 【実際の処理実行】: useHazardLayers composable を呼び出す
      useHazardLayers(map, isLoaded)

      // watchEffect の実行を待つ
      await nextTick()

      // 【結果検証】: addSource が6回呼ばれたことを確認
      // 🔵 HAZARD_LAYERS の要素数6と一致
      expect(mapMock.addSource).toHaveBeenCalledTimes(6) // 【確認内容】: 6種のハザードレイヤーソースが全て追加される
    })

    it('TC-002: マップロード完了時に6種のハザードレイヤーが追加される', async () => {
      // 【テスト目的】: isLoaded=true の状態で、map.addLayer が6回呼ばれること
      // 【テスト内容】: 6つのラスターレイヤーが map.addLayer で追加される
      // 【期待される動作】: addLayer が6回呼ばれる（既存実装では addLayer は未実装のため失敗するはず）
      // 🔵 REQ-020 完了条件「6種のハザードレイヤーが追加される」より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【結果検証】: addLayer が6回呼ばれたことを確認
      // 🔵 HAZARD_LAYERS の要素数6と一致
      expect(mapMock.addLayer).toHaveBeenCalledTimes(6) // 【確認内容】: 6種のハザードレイヤーが全て追加される
    })

    it('TC-003: 各ソースがラスタータイル形式で正しいパラメータで追加される', async () => {
      // 【テスト目的】: addSource の引数が正しいラスタータイル設定を含むこと
      // 【テスト内容】: 最初のレイヤー（洪水浸水想定区域）のソース設定を詳細チェック
      // 【期待される動作】: type: 'raster', tileSize: 256, attribution 付きでソースが追加される
      // 🔵 config/map.ts HAZARD_LAYERS[0] + NFR-401 著作権表示要件より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【検証項目】: sourceId が 'hazard_flood' であること
      // 🔵 config/map.ts HAZARD_LAYERS[0].sourceId より
      expect(mapMock.addSource).toHaveBeenCalledWith(
        'hazard_flood',
        expect.objectContaining({
          type: 'raster', // 【確認内容】: ラスタータイル形式で追加されること
          tileSize: 256, // 【確認内容】: タイルサイズが256pxであること
          tiles: [expect.stringContaining('01_flood_l2_shinsuishin_data')], // 【確認内容】: GSI洪水タイルURLを参照すること
        })
      )

      // 【検証項目】: attribution（著作権表示）が含まれること
      // 🔵 NFR-401 GSI著作権表示要件より
      expect(mapMock.addSource).toHaveBeenCalledWith(
        'hazard_flood',
        expect.objectContaining({
          attribution: expect.stringContaining('disaportal.gsi.go.jp'), // 【確認内容】: GSI著作権表示が含まれること
        })
      )
    })

    it('TC-004: 各レイヤーがデフォルト非表示（visibility: none）で追加される', async () => {
      // 【テスト目的】: addLayer の引数に layout: { visibility: 'none' } が含まれること
      // 【テスト内容】: 全6レイヤーのデフォルト可視性を検証
      // 【期待される動作】: 全レイヤーが visibility: 'none' で追加される
      // 🔵 REQ-020 完了条件「デフォルト visibility: 'none'」より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【結果検証】: 全6回の addLayer 呼び出しで layout.visibility が 'none' であること
      // 🔵 REQ-020 完了条件 + 要件定義書 セクション4.2 レイヤー追加詳細フローより
      const addLayerCalls = mapMock.addLayer.mock.calls
      expect(addLayerCalls.length).toBe(6) // 前提条件確認

      addLayerCalls.forEach(([layerConfig]: [Record<string, unknown>]) => {
        const layout = layerConfig.layout as Record<string, unknown> | undefined
        // 【検証項目】: 各レイヤーの layout.visibility が 'none' であること
        expect(layout?.visibility).toBe('none') // 【確認内容】: 初期表示が非表示（none）であること
      })
    })

    it('TC-005: 各レイヤーのraster-opacityが0.7で設定される', async () => {
      // 【テスト目的】: addLayer の paint プロパティに raster-opacity が設定されること
      // 【テスト内容】: 全レイヤーの paint['raster-opacity'] を検証
      // 【期待される動作】: 全レイヤーで raster-opacity: 0.7 が設定される
      // 🔵 config/map.ts HAZARD_LAYERS 各要素の opacity: 0.7 より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      const addLayerCalls = mapMock.addLayer.mock.calls
      expect(addLayerCalls.length).toBe(6) // 前提条件確認

      addLayerCalls.forEach(([layerConfig]: [Record<string, unknown>]) => {
        const paint = layerConfig.paint as Record<string, unknown> | undefined
        // 【検証項目】: raster-opacity が 0.7 であること
        // 🔵 config/map.ts HAZARD_LAYERS[*].opacity = 0.7 より
        expect(paint?.['raster-opacity']).toBe(0.7) // 【確認内容】: レイヤーの不透明度が0.7であること
      })
    })

    it('TC-006: レイヤーIDとソースIDがHAZARD_LAYERS定義と一致する', async () => {
      // 【テスト目的】: addSource の sourceId と addLayer の id, source が HAZARD_LAYERS 定義と一致すること
      // 【テスト内容】: 全6レイヤーのID体系が正確に設定されること
      // 【期待される動作】: 6件全てのID値が config/map.ts の定義と一致する
      // 🔵 config/map.ts HAZARD_LAYERS 定義より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')
      const { HAZARD_LAYERS } = await import('../../config/map')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【検証項目】: 各 HAZARD_LAYERS 要素の sourceId と layerId が正確に使用されること
      HAZARD_LAYERS.forEach((layer, index) => {
        // 🔵 config/map.ts HAZARD_LAYERS[index].sourceId より
        expect(mapMock.addSource.mock.calls[index][0]).toBe(layer.sourceId) // 【確認内容】: addSource の第1引数が sourceId と一致すること
        // 🔵 config/map.ts HAZARD_LAYERS[index].layerId/sourceId より
        const addedLayer = mapMock.addLayer.mock.calls[index][0] as Record<string, unknown>
        expect(addedLayer.id).toBe(layer.layerId) // 【確認内容】: addLayer の id が layerId と一致すること
        expect(addedLayer.source).toBe(layer.sourceId) // 【確認内容】: addLayer の source が sourceId と一致すること
      })
    })

    it('TC-007: OpacityControlが左上（top-left）位置に追加される', async () => {
      // 【テスト目的】: map.addControl が 'top-left' 引数で呼ばれること
      // 【テスト内容】: OpacityControl インスタンスの配置位置を検証
      // 【期待される動作】: addControl が 'top-left' で呼ばれる
      // 🔵 REQ-021「OpacityControl を左上に配置」+ 完了条件より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【検証項目】: addControl が1回呼ばれること
      // 🔵 要件定義書 セクション2 副作用3 より
      expect(mapMock.addControl).toHaveBeenCalledTimes(1) // 【確認内容】: OpacityControlが1回だけ追加されること

      // 【検証項目】: 配置位置が 'top-left' であること
      // 🔵 REQ-021「position: 'top-left'」より
      expect(mapMock.addControl).toHaveBeenCalledWith(
        expect.any(Object),
        'top-left' // 【確認内容】: 左上位置に配置されること
      )
    })

    it('TC-008: OpacityControlのbaseLayersに全6レイヤーが登録される', async () => {
      // 【テスト目的】: OpacityControl コンストラクタに渡される baseLayers に全6件の layerId: label マッピングが含まれること
      // 【テスト内容】: OpacityControl のコンストラクタ引数を検証
      // 【期待される動作】: baseLayers に { 'hazard_flood-layer': '洪水浸水想定区域', ... } の形式で6件含む
      // 🔵 REQ-021 + config/map.ts HAZARD_LAYERS 定義より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')
      const { HAZARD_LAYERS } = await import('../../config/map')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【検証項目】: OpacityControl コンストラクタが1回呼ばれたこと
      // 🔵 要件定義書 セクション4.3 OpacityControl設定より
      expect(MockOpacityControl).toHaveBeenCalledTimes(1) // 【確認内容】: OpacityControlが1回初期化されること

      // 【検証項目】: baseLayers のキー数が6であること
      const constructorArgs = MockOpacityControl.mock.calls[0]?.[0] as { baseLayers: Record<string, string> } | undefined
      expect(constructorArgs).toBeDefined()
      expect(constructorArgs?.baseLayers).toBeDefined()
      expect(Object.keys(constructorArgs?.baseLayers ?? {}).length).toBe(6) // 【確認内容】: 6種全てのレイヤーがbaseLayersに登録されること

      // 【検証項目】: 各 layerId がキーとして存在し、label が値であること
      // 🔵 config/map.ts HAZARD_LAYERS 定義より
      HAZARD_LAYERS.forEach(layer => {
        expect(constructorArgs?.baseLayers[layer.layerId]).toBe(layer.label) // 【確認内容】: layerId→label の対応が正確であること
      })
    })

    it('TC-009: 全レイヤーのtypeがrasterで設定される', async () => {
      // 【テスト目的】: addLayer の引数でレイヤータイプが 'raster' であること
      // 【テスト内容】: 全6レイヤーの type プロパティを検証
      // 【期待される動作】: 全6レイヤーが type: 'raster' で追加される
      // 🔵 要件定義書 セクション4.2 + GSIラスタータイル仕様より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      const addLayerCalls = mapMock.addLayer.mock.calls
      expect(addLayerCalls.length).toBe(6) // 前提条件確認

      addLayerCalls.forEach(([layerConfig]: [Record<string, unknown>]) => {
        // 【検証項目】: type が 'raster' であること
        // 🔵 GSIタイル形式（ラスター）より
        expect(layerConfig.type).toBe('raster') // 【確認内容】: ラスタータイプのレイヤーであること
      })
    })
  })

  // ----------------------------------------------------------------
  // 2. 異常系テストケース
  // ----------------------------------------------------------------

  describe('異常系: null安全性・ガード条件', () => {
    it('TC-010: map.valueがnullの場合、何も実行されない', async () => {
      // 【テスト目的】: マップインスタンスが null の場合、副作用が発生しないこと
      // 【テスト内容】: map=null, isLoaded=false で useHazardLayers を呼び、副作用が無いことを検証
      // 【期待される動作】: watchEffect 内のガード条件で早期リターンし、何も実行されない
      // 🔵 既存実装 `if (!isLoaded.value || !map.value) return` より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      // 【テストデータ準備】: マップが null、isLoaded=false の状態
      const map = ref<MapMockType | null>(null)
      const isLoaded = ref(false)

      // 【実際の処理実行】: マップが null の状態で composable を呼び出す
      useHazardLayers(map as ReturnType<typeof ref>, isLoaded)
      await nextTick()

      // 【結果検証】: 副作用が一切発生しないこと
      // 🔵 既存実装のガード条件より（mapMock は使用されないため呼び出し回数は0）
      expect(mapMock.addSource).not.toHaveBeenCalled() // 【確認内容】: addSource が呼ばれないこと
      expect(mapMock.addLayer).not.toHaveBeenCalled() // 【確認内容】: addLayer が呼ばれないこと
      expect(mapMock.addControl).not.toHaveBeenCalled() // 【確認内容】: addControl が呼ばれないこと
    })

    it('TC-011: isLoadedがfalseの場合、レイヤー追加が実行されない', async () => {
      // 【テスト目的】: マップインスタンスは存在するが isLoaded=false の場合、副作用が発生しないこと
      // 【テスト内容】: map=mapMock, isLoaded=false で useHazardLayers を呼ぶ
      // 【期待される動作】: watchEffect 内の isLoaded チェックで早期リターン
      // 🔵 既存実装のガード条件 `if (!isLoaded.value || !map.value) return` より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(false) // マップロード未完了状態

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【検証項目】: マップロード未完了時に副作用が発生しないこと
      expect(mapMock.addSource).not.toHaveBeenCalled() // 【確認内容】: addSource が呼ばれないこと
      expect(mapMock.addLayer).not.toHaveBeenCalled() // 【確認内容】: addLayer が呼ばれないこと
      expect(mapMock.addControl).not.toHaveBeenCalled() // 【確認内容】: addControl が呼ばれないこと
    })

    it('TC-012: mapがnullでisLoadedがtrueの場合、何も実行されない', async () => {
      // 【テスト目的】: isLoaded=true だが map=null の不整合状態で安全にスキップされること
      // 【テスト内容】: map=null, isLoaded=true で useHazardLayers を呼ぶ
      // 【期待される動作】: watchEffect のガード条件 (!map.value) で早期リターン
      // 🟡 既存実装ガード条件から妥当な推測（マップ破棄後のタイミング問題ケース）

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref<MapMockType | null>(null) // マップが存在しない
      const isLoaded = ref(true) // ロード完了フラグだけ true の不整合状態

      useHazardLayers(map as ReturnType<typeof ref>, isLoaded)
      await nextTick()

      // 【検証項目】: 不整合状態でも副作用なし（クラッシュしないこと）
      // 🟡 ガード条件 `!map.value` で保護されるはず
      expect(mapMock.addSource).not.toHaveBeenCalled() // 【確認内容】: addSource が呼ばれないこと
      expect(mapMock.addLayer).not.toHaveBeenCalled() // 【確認内容】: addLayer が呼ばれないこと
      expect(mapMock.addControl).not.toHaveBeenCalled() // 【確認内容】: addControl が呼ばれないこと
    })
  })

  // ----------------------------------------------------------------
  // 3. 境界値テストケース
  // ----------------------------------------------------------------

  describe('境界値: watchEffectリアクティブ動作', () => {
    it('TC-013: isLoadedがfalseからtrueに変化した時にレイヤーが追加される', async () => {
      // 【テスト目的】: watchEffect が isLoaded の false→true 遷移を検知してレイヤー追加を実行すること
      // 【テスト内容】: isLoaded=false で初期化後、true に変更して副作用の発生を検証
      // 【期待される動作】: false 時は何もせず、true 変更後に全レイヤーが追加される
      // 🟡 Vue 3 watchEffect 仕様 + 要件定義書セクション4.5 watchEffect再実行パターンより

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(false) // 初期状態: ロード未完了

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【検証項目】: 初期状態（false）では副作用なし
      expect(mapMock.addSource).not.toHaveBeenCalled() // 【確認内容】: 初期状態でaddSourceが呼ばれないこと

      // 【実際の処理実行】: isLoaded を true に変更してリアクティブ更新をトリガー
      isLoaded.value = true
      await nextTick()

      // 【検証項目】: true 変更後にレイヤーが追加される
      // 🟡 watchEffect のリアクティブ再実行を前提
      expect(mapMock.addSource).toHaveBeenCalledTimes(6) // 【確認内容】: true変更後に6つのソースが追加されること
      expect(mapMock.addLayer).toHaveBeenCalledTimes(6) // 【確認内容】: true変更後に6つのレイヤーが追加されること
      expect(mapMock.addControl).toHaveBeenCalledTimes(1) // 【確認内容】: true変更後にOpacityControlが追加されること
    })

    it('TC-014: HAZARD_LAYERS定数の全6要素が漏れなく処理される', async () => {
      // 【テスト目的】: HAZARD_LAYERS の全要素（先頭〜末尾）が漏れなく処理されること
      // 【テスト内容】: addSource の全引数から sourceId を抽出し、HAZARD_LAYERS と比較
      // 【期待される動作】: 6件全ての sourceId が処理される（off-by-one エラーがないこと）
      // 🔵 config/map.ts HAZARD_LAYERS（6件）より

      const { useHazardLayers } = await import('../../composables/useHazardLayers')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      const addSourceCalls = mapMock.addSource.mock.calls
      const sourceIds = addSourceCalls.map(([id]: [string]) => id)

      // 【検証項目】: 最初の要素が処理されること
      // 🔵 HAZARD_LAYERS[0].sourceId = 'hazard_flood'
      expect(sourceIds).toContain('hazard_flood') // 【確認内容】: 洪水ハザードレイヤーが含まれること

      // 【検証項目】: 最後の要素が処理されること
      // 🔵 HAZARD_LAYERS[5].sourceId = 'hazard_jisuberi'
      expect(sourceIds).toContain('hazard_jisuberi') // 【確認内容】: 地滑りハザードレイヤーが含まれること

      // 【検証項目】: 全6件が含まれること（順序も確認）
      // 🔵 HAZARD_LAYERS 全要素の sourceId
      expect(sourceIds).toEqual([
        'hazard_flood',
        'hazard_hightide',
        'hazard_tsunami',
        'hazard_doseki',
        'hazard_kyukeisha',
        'hazard_jisuberi',
      ]) // 【確認内容】: 全6種のsourceIdがHAZARD_LAYERS定義順で処理されること
    })

    it('TC-015: ソース追加とレイヤー追加の順序がHAZARD_LAYERS定義順と一致する', async () => {
      // 【テスト目的】: addSource と addLayer の順序・対応関係が HAZARD_LAYERS 定義と一致すること
      // 【テスト内容】: addSource の sourceId と addLayer の source プロパティの対応を検証
      // 【期待される動作】: 各インデックスで sourceId が一致する（ソース→レイヤーの参照整合性）
      // 🟡 MapLibre GL JS の API 制約（ソース追加→レイヤー追加の順序）から妥当な推測

      const { useHazardLayers } = await import('../../composables/useHazardLayers')
      const { HAZARD_LAYERS } = await import('../../config/map')

      const map = ref(mapMock)
      const isLoaded = ref(true)

      useHazardLayers(map, isLoaded)
      await nextTick()

      // 【検証項目】: 各インデックスで sourceId とレイヤーの source 参照が一致すること
      HAZARD_LAYERS.forEach((layer, index) => {
        const sourceId = mapMock.addSource.mock.calls[index][0] as string
        const addedLayer = mapMock.addLayer.mock.calls[index][0] as Record<string, unknown>
        const layerSource = addedLayer.source as string

        // 🟡 MapLibre 仕様: レイヤーは追加済みソースを参照する必要がある
        expect(sourceId).toBe(layerSource) // 【確認内容】: ソースIDとレイヤーのsource参照が一致すること
        expect(sourceId).toBe(layer.sourceId) // 【確認内容】: HAZARD_LAYERS定義のsourceIdと一致すること
      })
    })
  })

  // ----------------------------------------------------------------
  // 4. 実装パターン確認
  // ----------------------------------------------------------------

  describe('実装パターン: モジュールエクスポート', () => {
    it('TC-016: useHazardLayersが関数としてエクスポートされている', async () => {
      // 【テスト目的】: useHazardLayers が正しくエクスポートされ、インポート可能であること
      // 【テスト内容】: import した useHazardLayers が関数であることを検証
      // 【期待される動作】: typeof が 'function' であること
      // 🔵 既存実装 export const useHazardLayers = (...) => { ... } より

      const module = await import('../../composables/useHazardLayers')

      // 【検証項目】: useHazardLayers が名前付きエクスポートとして存在すること
      expect(module.useHazardLayers).toBeDefined() // 【確認内容】: useHazardLayers がエクスポートされていること
      expect(typeof module.useHazardLayers).toBe('function') // 【確認内容】: useHazardLayers が関数であること
    })
  })
})
