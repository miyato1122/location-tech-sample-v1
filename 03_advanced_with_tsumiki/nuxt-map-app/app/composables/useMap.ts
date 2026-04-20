import { ref, onMounted, onUnmounted } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { MAP_INIT_CONFIG } from '../../types'
import type { UseMapReturn } from '../../types'

/**
 * MapLibre GL JS のマップインスタンスを管理する composable
 * onMounted で動的インポートしてマップを初期化し、onUnmounted でクリーンアップする
 *
 * @param containerId - マップを描画するDOM要素のID
 * @returns map ref を含むオブジェクト
 */
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
