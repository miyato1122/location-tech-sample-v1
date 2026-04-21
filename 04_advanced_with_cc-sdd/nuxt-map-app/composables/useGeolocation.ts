// maplibre-gl v2.4.0 の型定義は TypeScript 6.0 と非互換のため as any でキャストする
import maplibreglRaw from 'maplibre-gl'
import type { Ref } from 'vue'
import { ref, watchEffect } from 'vue'
import distance from '@turf/distance'
import type { Coordinate, MapInstance, ShelterVisibleFilter } from '~/types/map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const maplibregl = maplibreglRaw as any

export const useGeolocation = (
  map: Readonly<Ref<MapInstance | null>>,
  isLoaded: Readonly<Ref<boolean>>,
  getVisibleLayerFilter: () => ShelterVisibleFilter,
) => {
  const userLocation = ref<Coordinate | null>(null)

  const emptyCollection = () => ({
    type: 'FeatureCollection' as const,
    features: [] as GeoJSON.Feature[],
  })

  watchEffect(() => {
    if (!isLoaded.value || !map.value) return

    const mapInstance = map.value

    // GeolocateControl を右下に追加
    const geolocationControl = new maplibregl.GeolocateControl({
      trackUserLocation: true,
    })
    mapInstance.addControl(geolocationControl, 'bottom-right')

    // 位置情報が更新されたら userLocation を更新
    geolocationControl.on('geolocate', (e: GeolocationPosition) => {
      userLocation.value = [e.coords.longitude, e.coords.latitude]
    })

    // render イベント: 毎フレームごとにルートラインを更新
    mapInstance.on('render', () => {
      // GeolocateControl がオフなら現在地をリセット
      if (geolocationControl._watchState === 'OFF') {
        userLocation.value = null
      }

      const routeSource = mapInstance.getSource('route')

      // ズームが低い・現在地なしの場合はルートを消去
      if (mapInstance.getZoom() < 7 || userLocation.value === null) {
        routeSource?.setData(emptyCollection())
        return
      }

      // 表示中の避難場所フィルターを取得
      const filter = getVisibleLayerFilter()
      if (!filter) {
        routeSource?.setData(emptyCollection())
        return
      }

      // 現在表示中の SKHB タイル地物を取得
      const features = mapInstance.querySourceFeatures('skhb', {
        sourceLayer: 'skhb',
        filter,
      })

      if (features.length === 0) {
        routeSource?.setData(emptyCollection())
        return
      }

      // 最寄り避難場所を Turf.js で特定
      const [lon, lat] = userLocation.value
      let nearestFeature: (typeof features)[0] | null = null
      let nearestDist = Infinity

      for (const feature of features) {
        const geom = feature.geometry as { type: string; coordinates: number[] }
        const dist = distance([lon, lat], geom.coordinates)
        if (dist < nearestDist) {
          nearestDist = dist
          nearestFeature = feature
        }
      }

      if (!nearestFeature) return

      const nearestCoords = (nearestFeature.geometry as { type: string; coordinates: number[] }).coordinates

      // route source に現在地〜最寄り避難場所の LineString をセット
      routeSource?.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [userLocation.value, nearestCoords],
            },
            properties: null,
          },
        ],
      })
    })
  })

  return { userLocation }
}
