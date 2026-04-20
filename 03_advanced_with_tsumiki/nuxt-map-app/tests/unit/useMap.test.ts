import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { useMap } from '~/app/composables/useMap'

// --- Mock maplibre-gl ---
const mockRemove = vi.fn()
// アロー関数は new で呼び出せないため通常の関数を使用
const MockMap = vi.fn(function () {
  return { remove: mockRemove }
})

vi.mock('maplibre-gl', () => ({
  Map: MockMap,
}))

// --- Helper: withSetup ---
function withSetup<T>(composable: () => T) {
  let result!: T
  const Wrapper = defineComponent({
    setup() {
      result = composable()
      return () => null
    },
  })
  const wrapper = mount(Wrapper, {
    attachTo: document.createElement('div'),
  })
  return { result, wrapper }
}

describe('useMap composable (TASK-0006)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const container = document.createElement('div')
    container.id = 'map'
    document.body.appendChild(container)
  })

  afterEach(() => {
    const el = document.getElementById('map')
    if (el) el.remove()
  })

  describe('TC-01: 初期状態', () => {
    it('useMap() が返す map.value の初期値は null である', () => {
      const { result, wrapper } = withSetup(() => useMap('map'))
      expect(result.map.value).toBeNull()
      wrapper.unmount()
    })

    it('返り値が UseMapReturn 型（map プロパティを持つオブジェクト）である', () => {
      const { result, wrapper } = withSetup(() => useMap('map'))
      expect(result).toHaveProperty('map')
      wrapper.unmount()
    })
  })

  describe('TC-02/TC-04: マウント後の初期化', () => {
    it('onMounted 後に Map コンストラクタが呼ばれる', async () => {
      const { wrapper } = withSetup(() => useMap('map'))
      await flushPromises()
      expect(MockMap).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('onMounted + 動的import解決後に map.value が非null になる', async () => {
      const { result, wrapper } = withSetup(() => useMap('map'))
      await flushPromises()
      expect(result.map.value).not.toBeNull()
      wrapper.unmount()
    })
  })

  describe('TC-03/TC-08: Map コンストラクタのオプション', () => {
    let opts: Record<string, unknown>
    let wrapper: ReturnType<typeof withSetup>['wrapper']

    beforeEach(async () => {
      const setup = withSetup(() => useMap('map'))
      wrapper = setup.wrapper
      await flushPromises()
      opts = (MockMap as Mock).mock.calls[0][0]
    })

    afterEach(() => {
      wrapper.unmount()
    })

    it('container に containerId が渡される', () => {
      expect(opts.container).toBe('map')
    })

    it('zoom: 5 が渡される', () => {
      expect(opts.zoom).toBe(5)
    })

    it('center: [138, 37] が渡される', () => {
      expect(opts.center).toEqual([138, 37])
    })

    it('minZoom: 5 が渡される', () => {
      expect(opts.minZoom).toBe(5)
    })

    it('maxZoom: 18 が渡される', () => {
      expect(opts.maxZoom).toBe(18)
    })

    it('maxBounds: [122, 20, 154, 50] が渡される', () => {
      expect(opts.maxBounds).toEqual([122, 20, 154, 50])
    })

    it('style に OSM ラスタータイルのインラインスタイルが設定される', () => {
      expect(opts.style).toHaveProperty('version', 8)
      expect(opts.style).toHaveProperty('sources')
      expect(opts.style).toHaveProperty('layers')
    })
  })

  describe('TC-05/TC-06: アンマウント処理', () => {
    it('コンポーネントアンマウント時に map.remove() が1回呼ばれる', async () => {
      const { wrapper } = withSetup(() => useMap('map'))
      await flushPromises()
      wrapper.unmount()
      expect(mockRemove).toHaveBeenCalledTimes(1)
    })

    it('アンマウント後に map.value が null に戻る', async () => {
      const { result, wrapper } = withSetup(() => useMap('map'))
      await flushPromises()
      expect(result.map.value).not.toBeNull()
      wrapper.unmount()
      expect(result.map.value).toBeNull()
    })
  })

  describe('TC-07: null ガード', () => {
    it('map 初期化前にアンマウントしても remove() は呼ばれない', () => {
      const { wrapper } = withSetup(() => useMap('map'))
      wrapper.unmount() // flushPromises() なしで即座にアンマウント
      expect(mockRemove).not.toHaveBeenCalled()
    })
  })
})
