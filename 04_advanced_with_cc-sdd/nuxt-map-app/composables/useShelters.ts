// maplibre-gl v2.4.0 の型定義は TypeScript 6.0 と非互換のため as any でキャストする
import maplibreglRaw from 'maplibre-gl'
import type { Ref } from 'vue'
import { watchEffect } from 'vue'
import OpacityControl from 'maplibre-gl-opacity'
import { SHELTER_LAYERS } from '~/config/map'
import type { MapInstance, ShelterProperties, ShelterVisibleFilter } from '~/types/map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const maplibregl = maplibreglRaw as any

/** HTML 特殊文字をエスケープする（XSS 対策） */
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

export const useShelters = (
  map: Readonly<Ref<MapInstance | null>>,
  isLoaded: Readonly<Ref<boolean>>,
) => {
  /**
   * 現在表示中の skhb レイヤーの filter 条件を返す
   * 表示中レイヤーがない場合は null を返す
   */
  const getVisibleLayerFilter = (): ShelterVisibleFilter => {
    if (!map.value) return null

    const style = map.value.getStyle()
    const skhbLayers = style.layers.filter((l: { id: string }) => l.id.startsWith('skhb'))

    const visibleLayer = skhbLayers.find(
      (l: { layout?: { visibility?: string } }) => l.layout?.visibility === 'visible',
    )
    if (!visibleLayer) return null

    const filter = (visibleLayer as { filter?: unknown }).filter
    if (!filter) return null
    return filter as ShelterVisibleFilter
  }

  watchEffect(() => {
    if (!isLoaded.value || !map.value) return

    const mapInstance = map.value
    const skhbLayerIds = SHELTER_LAYERS.map((l) => l.layerId)

    // 右上に OpacityControl を追加（避難場所フィルター）
    const baseLayers = Object.fromEntries(
      SHELTER_LAYERS.map((layer) => [layer.layerId, layer.label]),
    )
    const opacitySkhb = new OpacityControl({ baseLayers })
    mapInstance.addControl(opacitySkhb, 'top-right')

    // マーカークリック時のポップアップ表示
    mapInstance.on('click', (e: unknown) => {
      const features = mapInstance.queryRenderedFeatures((e as { point: unknown }).point, {
        layers: skhbLayerIds,
      })
      if (features.length === 0) return

      const feature = features[0]
      const props = feature.properties as unknown as ShelterProperties

      const disasterSpans = [
        { key: 'disaster1', label: '洪水' },
        { key: 'disaster2', label: '崖崩れ/土石流/地滑り' },
        { key: 'disaster3', label: '高潮' },
        { key: 'disaster4', label: '地震' },
        { key: 'disaster5', label: '津波' },
        { key: 'disaster6', label: '大規模な火事' },
        { key: 'disaster7', label: '内水氾濫' },
        { key: 'disaster8', label: '火山現象' },
      ]
        .map(({ key, label }) => {
          const active = props[key as keyof ShelterProperties]
          return `<span${active ? '' : ' style="color:#ccc;"'}>${escapeHtml(label)}</span>`
        })
        .join(' ')

      const html = `
        <div style="font-weight:900;font-size:1.2rem;">${escapeHtml(props.name ?? '')}</div>
        <div>${escapeHtml(props.address ?? '')}</div>
        <div>${escapeHtml(props.remarks ?? '')}</div>
        <div>${disasterSpans}</div>
      `

      const coords = (feature.geometry as { coordinates: [number, number] }).coordinates
      new maplibregl.Popup()
        .setLngLat(coords)
        .setHTML(html)
        .setMaxWidth('400px')
        .addTo(mapInstance)
    })

    // マーカーホバー時のカーソル変更
    mapInstance.on('mousemove', (e: unknown) => {
      const features = mapInstance.queryRenderedFeatures((e as { point: unknown }).point, {
        layers: skhbLayerIds,
      })
      mapInstance.getCanvas().style.cursor = features.length > 0 ? 'pointer' : ''
    })
  })

  return { getVisibleLayerFilter }
}
