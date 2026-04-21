// maplibre-gl v2.4.0 の型定義は TypeScript 6.0 と非互換のため as any でキャストする
import maplibreglRaw from 'maplibre-gl'
import { ref, readonly } from 'vue'
import { MAP_INIT, HAZARD_LAYERS, SHELTER_LAYERS, getSkhbTileUrl } from '~/config/map'
import type { MapInstance } from '~/types/map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const maplibregl = maplibreglRaw as any

export const useMap = () => {
  const map = ref<MapInstance | null>(null)
  const isLoaded = ref(false)

  const initMap = (container: HTMLElement): void => {
    const runtimeConfig = useRuntimeConfig()
    const skhbTileUrl = getSkhbTileUrl(runtimeConfig.app.baseURL)

    // ハザードソース定義
    const hazardSources = Object.fromEntries(
      HAZARD_LAYERS.map((layer) => [
        layer.sourceId,
        {
          type: 'raster' as const,
          tiles: [layer.tileUrl],
          minzoom: 2,
          maxzoom: 17,
          tileSize: 256,
          attribution:
            '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
        },
      ]),
    )

    // ハザードレイヤー定義（初期非表示）
    const hazardLayers = HAZARD_LAYERS.map((layer) => ({
      id: layer.layerId,
      source: layer.sourceId,
      type: 'raster' as const,
      paint: { 'raster-opacity': layer.opacity },
      layout: { visibility: 'none' as const },
    }))

    // 避難場所レイヤー定義（初期非表示）
    const shelterLayers = SHELTER_LAYERS.map((layer) => ({
      id: layer.layerId,
      source: 'skhb',
      'source-layer': 'skhb',
      type: 'circle' as const,
      paint: {
        'circle-color': '#6666cc',
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5,
          2,
          14,
          6,
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
      },
      filter: ['get', layer.disasterKey],
      layout: { visibility: 'none' as const },
    }))

    const instance: MapInstance = new maplibregl.Map({
      container,
      zoom: MAP_INIT.zoom,
      center: MAP_INIT.center,
      minZoom: MAP_INIT.minZoom,
      maxZoom: MAP_INIT.maxZoom,
      maxBounds: MAP_INIT.maxBounds,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            maxzoom: 19,
            tileSize: 256,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
          ...hazardSources,
          skhb: {
            type: 'vector',
            tiles: [skhbTileUrl],
            minzoom: 5,
            maxzoom: 8,
            attribution:
              '<a href="https://www.gsi.go.jp/bousaichiri/hinanbasho.html" target="_blank">国土地理院:指定緊急避難場所データ</a>',
          },
          route: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          },
        },
        layers: [
          // 背景地図
          { id: 'osm-layer', source: 'osm', type: 'raster' as const },
          // ハザードレイヤー
          ...hazardLayers,
          // ルートライン
          {
            id: 'route-layer',
            source: 'route',
            type: 'line' as const,
            paint: {
              'line-color': '#33aaff',
              'line-width': 4,
            },
          },
          // 避難場所レイヤー
          ...shelterLayers,
        ],
      },
    })

    instance.on('error', (e: unknown) => {
      console.error('[MapLibre]', e)
    })

    // ロード完了イベント（loaded() フォールバック付き）
    if (instance.loaded()) {
      isLoaded.value = true
    }
    else {
      instance.on('load', () => {
        isLoaded.value = true
      })
    }

    map.value = instance
  }

  const destroyMap = (): void => {
    if (map.value) {
      map.value.remove()
      map.value = null
      isLoaded.value = false
    }
  }

  return {
    map: readonly(map),
    isLoaded: readonly(isLoaded),
    initMap,
    destroyMap,
  }
}
