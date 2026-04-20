# useMap composable - Green フェーズ

## 実装日時
2026-04-20

## 実装方針
- `vi.mock('maplibre-gl', ...)` のホイスティング問題により、静的インポートは使用不可
- 動的インポート `const { Map } = await import('maplibre-gl')` を採用
- `vi.fn()` のアロー関数実装が `new` でコンストラクタとして使えないため、テストコードの `MockMap` を通常の関数に修正

## 実装ファイル

### `app/composables/useMap.ts`（新規作成）

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { MAP_INIT_CONFIG } from '~/types'
import type { UseMapReturn } from '~/types'

export function useMap(containerId: string): UseMapReturn {
  const map = ref<MaplibreMap | null>(null)

  onMounted(async () => {
    const { Map } = await import('maplibre-gl')
    map.value = new Map({
      container: containerId,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      zoom: MAP_INIT_CONFIG.zoom,
      center: MAP_INIT_CONFIG.center,
      minZoom: MAP_INIT_CONFIG.minZoom,
      maxZoom: MAP_INIT_CONFIG.maxZoom,
      maxBounds: MAP_INIT_CONFIG.maxBounds,
    }) as MaplibreMap
  })

  onUnmounted(() => {
    map.value?.remove()
    map.value = null
  })

  return { map }
}
```

### `tests/unit/useMap.test.ts`（修正）

- `vi.fn(() => ({ remove: mockRemove }))` のアロー関数を通常の関数に変更
- `vi.fn(function () { return { remove: mockRemove } })` に修正

## テスト実行結果

```
Test Files  1 passed (1)
    Tests  14 passed (14)
  Start at  16:28:17
  Duration  538ms
```

全14テストが通過。

## テストケース対応表

| テストケース | 内容 | 結果 |
|---|---|---|
| TC-01 (1) | map.value の初期値が null | ✅ |
| TC-01 (2) | UseMapReturn 型（map プロパティ）を持つ | ✅ |
| TC-02 | onMounted 後に Map コンストラクタが呼ばれる | ✅ |
| TC-04 | onMounted + 動的import解決後に map.value が非null | ✅ |
| TC-03 (1) | container に containerId が渡される | ✅ |
| TC-03 (2) | zoom: 5 が渡される | ✅ |
| TC-03 (3) | center: [138, 37] が渡される | ✅ |
| TC-03 (4) | minZoom: 5 が渡される | ✅ |
| TC-03 (5) | maxZoom: 18 が渡される | ✅ |
| TC-03 (6) | maxBounds: [122, 20, 154, 50] が渡される | ✅ |
| TC-08 | style に OSM ラスタータイルのインラインスタイル | ✅ |
| TC-05 | アンマウント時に map.remove() が1回呼ばれる | ✅ |
| TC-06 | アンマウント後に map.value が null に戻る | ✅ |
| TC-07 | 初期化前アンマウントでも remove() が呼ばれない | ✅ |

## 課題・改善点（Refactor フェーズで対応）

1. **TypeScript 型の厳密化**: `as MaplibreMap` の型アサーションを排除する方法を検討
2. **エラーハンドリング**: 動的インポート失敗時の処理
3. **日本語コメントの整理**: コメントをより簡潔に整理
