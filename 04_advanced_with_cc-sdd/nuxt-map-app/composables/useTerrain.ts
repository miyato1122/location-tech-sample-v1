// maplibre-gl v2.4.0 の型定義は TypeScript 6.0 と非互換のため as any でキャストする
import maplibreglRaw from 'maplibre-gl'
import type { Ref } from 'vue'
import { watchEffect } from 'vue'
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain'
import { HILLSHADE_CONFIG, TERRAIN_CONFIG } from '~/config/map'
import type { MapInstance } from '~/types/map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const maplibregl = maplibreglRaw as any

export const useTerrain = (
  map: Readonly<Ref<MapInstance | null>>,
  isLoaded: Readonly<Ref<boolean>>,
) => {
  watchEffect(() => {
    if (!isLoaded.value || !map.value) return

    const mapInstance = map.value

    // 地理院標高タイルを raster-dem ソースとして追加
    const gsiTerrainSource = useGsiTerrainSource(maplibregl.addProtocol)
    mapInstance.addSource('terrain', gsiTerrainSource)

    // 陰影図レイヤーを hazard_jisuberi-layer の手前に挿入
    mapInstance.addLayer(
      {
        id: 'hillshade',
        source: 'terrain',
        type: 'hillshade',
        paint: {
          'hillshade-illumination-anchor': 'map',
          'hillshade-exaggeration': HILLSHADE_CONFIG.exaggeration,
        },
      },
      'hazard_jisuberi-layer',
    )

    // 3D 地形コントロール（標高倍率 1 倍）
    mapInstance.addControl(
      new maplibregl.TerrainControl({
        source: 'terrain',
        exaggeration: TERRAIN_CONFIG.exaggeration,
      }),
    )
  })
}
