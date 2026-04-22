<template>
  <div style="position: relative; height: 100vh; overflow: hidden">
    <div id="map" style="height: 100vh" />
    <div id="basemap-control">
      <label v-for="basemap in BASEMAPS" :key="basemap.id">
        <input
          type="radio"
          name="basemap"
          :value="basemap.id"
          :checked="basemap.id === 'osm'"
          @change="switchBasemap(basemap.id)"
        />
        {{ basemap.label }}
      </label>
    </div>
    <div id="tile-error-message">背景地図の読み込みに失敗しました</div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import maplibregl, { addProtocol } from 'maplibre-gl'
import OpacityControl from 'maplibre-gl-opacity'
import distance from '@turf/distance'
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain'

const BASEMAPS = [
  { id: 'osm', label: 'OpenStreetMap', layerId: 'osm-layer' },
  { id: 'gsi-std', label: '地理院地図', layerId: 'gsi-std-layer' },
  { id: 'gsi-photo', label: '航空写真', layerId: 'gsi-photo-layer' },
]

let map = null
let userLocation = null

const switchBasemap = (id) => {
  if (!map) return
  BASEMAPS.forEach((basemap) => {
    map.setLayoutProperty(basemap.layerId, 'visibility', basemap.id === id ? 'visible' : 'none')
  })
}

const getCurrentSkhbLayerFilter = () => {
  const style = map.getStyle()
  const skhbLayers = style.layers.filter((layer) => layer.id.startsWith('skhb'))
  const visibleSkhbLayers = skhbLayers.filter(
    (layer) => layer.layout.visibility === 'visible',
  )
  return visibleSkhbLayers[0]?.filter
}

const getNearestFeature = (longitude, latitude) => {
  const currentSkhbLayerFilter = getCurrentSkhbLayerFilter()
  if (!currentSkhbLayerFilter) return null
  const features = map.querySourceFeatures('skhb', {
    sourceLayer: 'skhb',
    filter: currentSkhbLayerFilter,
  })
  return features.reduce((minDistFeature, feature) => {
    const dist = distance([longitude, latitude], feature.geometry.coordinates)
    if (minDistFeature === null || minDistFeature.properties.dist > dist) {
      // v5: geometry は non-enumerable のため spread で消えるので明示的に保持する
      return { ...feature, geometry: feature.geometry, properties: { ...feature.properties, dist } }
    }
    return minDistFeature
  }, null)
}

const SKHB_LAYER_IDS = [
  'skhb-1-layer',
  'skhb-2-layer',
  'skhb-3-layer',
  'skhb-4-layer',
  'skhb-5-layer',
  'skhb-6-layer',
  'skhb-7-layer',
  'skhb-8-layer',
]

onMounted(() => {
  map = new maplibregl.Map({
    container: 'map',
    zoom: 5,
    center: [138, 37],
    minZoom: 5,
    maxZoom: 18,
    maxBounds: [122, 20, 154, 50],
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
        'gsi-std': {
          type: 'raster',
          tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
          maxzoom: 18,
          tileSize: 256,
          attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
        },
        'gsi-photo': {
          type: 'raster',
          tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
          maxzoom: 18,
          tileSize: 256,
          attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
        },
        hazard_flood: {
          type: 'raster',
          tiles: [
            'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',
          ],
          minzoom: 2,
          maxzoom: 17,
          tileSize: 256,
          attribution:
            '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
        },
        hazard_hightide: {
          type: 'raster',
          tiles: [
            'https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png',
          ],
          minzoom: 2,
          maxzoom: 17,
          tileSize: 256,
          attribution:
            '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
        },
        hazard_tsunami: {
          type: 'raster',
          tiles: [
            'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
          ],
          minzoom: 2,
          maxzoom: 17,
          tileSize: 256,
          attribution:
            '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
        },
        hazard_doseki: {
          type: 'raster',
          tiles: [
            'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png',
          ],
          minzoom: 2,
          maxzoom: 17,
          tileSize: 256,
          attribution:
            '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
        },
        hazard_kyukeisha: {
          type: 'raster',
          tiles: [
            'https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png',
          ],
          minzoom: 2,
          maxzoom: 17,
          tileSize: 256,
          attribution:
            '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
        },
        hazard_jisuberi: {
          type: 'raster',
          tiles: [
            'https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png',
          ],
          minzoom: 2,
          maxzoom: 17,
          tileSize: 256,
          attribution:
            '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html">ハザードマップポータルサイト</a>',
        },
        skhb: {
          type: 'vector',
          tiles: [`${window.location.origin}/skhb/{z}/{x}/{y}.pbf`],
          minzoom: 5,
          maxzoom: 8,
          attribution:
            '<a href="https://www.gsi.go.jp/bousaichiri/hinanbasho.html" target="_blank">国土地理院:指定緊急避難場所データ</a>',
        },
        route: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        },
      },
      layers: [
        { id: 'gsi-std-layer', source: 'gsi-std', type: 'raster', layout: { visibility: 'none' } },
        { id: 'gsi-photo-layer', source: 'gsi-photo', type: 'raster', layout: { visibility: 'none' } },
        { id: 'osm-layer', source: 'osm', type: 'raster' },
        {
          id: 'hazard_flood-layer',
          source: 'hazard_flood',
          type: 'raster',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        },
        {
          id: 'hazard_hightide-layer',
          source: 'hazard_hightide',
          type: 'raster',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        },
        {
          id: 'hazard_tsunami-layer',
          source: 'hazard_tsunami',
          type: 'raster',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        },
        {
          id: 'hazard_doseki-layer',
          source: 'hazard_doseki',
          type: 'raster',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        },
        {
          id: 'hazard_kyukeisha-layer',
          source: 'hazard_kyukeisha',
          type: 'raster',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        },
        {
          id: 'hazard_jisuberi-layer',
          source: 'hazard_jisuberi',
          type: 'raster',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        },
        {
          id: 'route-layer',
          source: 'route',
          type: 'line',
          paint: { 'line-color': '#33aaff', 'line-width': 4 },
        },
        {
          id: 'skhb-1-layer',
          source: 'skhb',
          'source-layer': 'skhb',
          type: 'circle',
          paint: {
            'circle-color': '#6666cc',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 14, 6],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['to-boolean', ['get', 'disaster1']],
          layout: { visibility: 'none' },
        },
        {
          id: 'skhb-2-layer',
          source: 'skhb',
          'source-layer': 'skhb',
          type: 'circle',
          paint: {
            'circle-color': '#6666cc',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 14, 6],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['to-boolean', ['get', 'disaster2']],
          layout: { visibility: 'none' },
        },
        {
          id: 'skhb-3-layer',
          source: 'skhb',
          'source-layer': 'skhb',
          type: 'circle',
          paint: {
            'circle-color': '#6666cc',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 14, 6],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['to-boolean', ['get', 'disaster3']],
          layout: { visibility: 'none' },
        },
        {
          id: 'skhb-4-layer',
          source: 'skhb',
          'source-layer': 'skhb',
          type: 'circle',
          paint: {
            'circle-color': '#6666cc',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 14, 6],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['to-boolean', ['get', 'disaster4']],
          layout: { visibility: 'none' },
        },
        {
          id: 'skhb-5-layer',
          source: 'skhb',
          'source-layer': 'skhb',
          type: 'circle',
          paint: {
            'circle-color': '#6666cc',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 14, 6],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['to-boolean', ['get', 'disaster5']],
          layout: { visibility: 'none' },
        },
        {
          id: 'skhb-6-layer',
          source: 'skhb',
          'source-layer': 'skhb',
          type: 'circle',
          paint: {
            'circle-color': '#6666cc',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 14, 6],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['to-boolean', ['get', 'disaster6']],
          layout: { visibility: 'none' },
        },
        {
          id: 'skhb-7-layer',
          source: 'skhb',
          'source-layer': 'skhb',
          type: 'circle',
          paint: {
            'circle-color': '#6666cc',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 14, 6],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['to-boolean', ['get', 'disaster7']],
          layout: { visibility: 'none' },
        },
        {
          id: 'skhb-8-layer',
          source: 'skhb',
          'source-layer': 'skhb',
          type: 'circle',
          paint: {
            'circle-color': '#6666cc',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 14, 6],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
          filter: ['to-boolean', ['get', 'disaster8']],
          layout: { visibility: 'none' },
        },
      ],
    },
  })

  map.on('error', (e) => {
    const backgroundSourceIds = ['osm', 'gsi-std', 'gsi-photo']
    if (e.sourceId && backgroundSourceIds.includes(e.sourceId)) {
      const errorMsg = document.getElementById('tile-error-message')
      if (errorMsg) {
        errorMsg.style.display = 'block'
        setTimeout(() => {
          errorMsg.style.display = 'none'
        }, 3000)
      }
    }
  })

  const geolocationControl = new maplibregl.GeolocateControl({
    trackUserLocation: true,
  })
  map.addControl(geolocationControl, 'bottom-right')
  geolocationControl.on('geolocate', (e) => {
    userLocation = [e.coords.longitude, e.coords.latitude]
  })
  // v5: _watchState プライベートAPIの代替
  geolocationControl.on('trackuserlocationend', () => {
    userLocation = null
  })

  map.on('load', () => {
    const opacity = new OpacityControl({
      baseLayers: {
        'hazard_flood-layer': '洪水浸水想定区域',
        'hazard_hightide-layer': '高潮浸水想定区域',
        'hazard_tsunami-layer': '津波浸水想定区域',
        'hazard_doseki-layer': '土石流警戒区域',
        'hazard_kyukeisha-layer': '急傾斜警戒区域',
        'hazard_jisuberi-layer': '地滑り警戒区域',
      },
    })
    map.addControl(opacity, 'top-left')

    const opacitySkhb = new OpacityControl({
      baseLayers: {
        'skhb-1-layer': '洪水',
        'skhb-2-layer': '崖崩れ/土石流/地滑り',
        'skhb-3-layer': '高潮',
        'skhb-4-layer': '地震',
        'skhb-5-layer': '津波',
        'skhb-6-layer': '大規模な火事',
        'skhb-7-layer': '内水氾濫',
        'skhb-8-layer': '火山現象',
      },
    })
    map.addControl(opacitySkhb, 'top-right')

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: SKHB_LAYER_IDS })
      if (features.length === 0) return

      const feature = features[0]
      const disasterSpan = (flag, label) =>
        `<span${flag ? '' : ' style="color:#ccc;"'}>${label}</span>`

      new maplibregl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
          `<div style="font-weight:900; font-size: 1.2rem;">${feature.properties.name}</div>` +
          `<div>${feature.properties.address}</div>` +
          `<div>${feature.properties.remarks ?? ''}</div>` +
          `<div>` +
          disasterSpan(feature.properties.disaster1, '洪水') +
          disasterSpan(feature.properties.disaster2, ' 崖崩れ/土石流/地滑り') +
          disasterSpan(feature.properties.disaster3, ' 高潮') +
          disasterSpan(feature.properties.disaster4, ' 地震') +
          `</div><div>` +
          disasterSpan(feature.properties.disaster5, '津波') +
          disasterSpan(feature.properties.disaster6, ' 大規模な火事') +
          disasterSpan(feature.properties.disaster7, ' 内水氾濫') +
          disasterSpan(feature.properties.disaster8, ' 火山現象') +
          `</div>`,
        )
        .setMaxWidth('400px')
        .addTo(map)
    })

    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: SKHB_LAYER_IDS })
      map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : ''
    })

    map.on('render', () => {
      if (map.getZoom() < 7 || userLocation === null) {
        map.getSource('route').setData({ type: 'FeatureCollection', features: [] })
        return
      }

      const nearestFeature = getNearestFeature(userLocation[0], userLocation[1])
      if (!nearestFeature) return

      // v5: _geometry.coordinates → geometry.coordinates
      map.getSource('route').setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [userLocation, nearestFeature.geometry.coordinates],
            },
          },
        ],
      })
    })

    // v5: addProtocol を named import で渡す
    const gsiTerrainSource = useGsiTerrainSource(addProtocol)
    map.addSource('terrain', gsiTerrainSource)
    map.addLayer(
      {
        id: 'hillshade',
        source: 'terrain',
        type: 'hillshade',
        paint: {
          'hillshade-illumination-anchor': 'map',
          'hillshade-exaggeration': 0.2,
        },
      },
      'hazard_jisuberi-layer',
    )
    map.addControl(
      new maplibregl.TerrainControl({
        source: 'terrain',
        exaggeration: 1,
      }),
    )
  })
})

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>
