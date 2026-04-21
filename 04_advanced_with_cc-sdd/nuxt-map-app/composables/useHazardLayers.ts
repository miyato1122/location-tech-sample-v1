import type { Ref } from 'vue'
import { watchEffect } from 'vue'
import OpacityControl from 'maplibre-gl-opacity'
import { HAZARD_LAYERS } from '~/config/map'
import type { MapInstance } from '~/types/map'

export const useHazardLayers = (
  map: Readonly<Ref<MapInstance | null>>,
  isLoaded: Readonly<Ref<boolean>>,
) => {
  watchEffect(() => {
    if (!isLoaded.value || !map.value) return

    // HAZARD_LAYERS からレイヤーID→ラベルのマップを生成
    const baseLayers = Object.fromEntries(
      HAZARD_LAYERS.map((layer) => [layer.layerId, layer.label]),
    )

    // 左上に OpacityControl を追加
    const opacityControl = new OpacityControl({ baseLayers })
    map.value.addControl(opacityControl, 'top-left')
  })
}
