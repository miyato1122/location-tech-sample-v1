import type { Ref } from 'vue'
import type { Map as MaplibreMap, FilterSpecification } from 'maplibre-gl'
import type { Feature, Point } from 'geojson'

// ========================================
// ベクトルタイル フィーチャー型
// ========================================

export interface SkhbProperties {
  name: string
  address: string
  remarks: string | null
  disaster1: boolean
  disaster2: boolean
  disaster3: boolean
  disaster4: boolean
  disaster5: boolean
  disaster6: boolean
  disaster7: boolean
  disaster8: boolean
}

export interface SkhbFeatureWithDistance extends Feature<Point, SkhbProperties> {
  properties: SkhbProperties & {
    dist: number
  }
}

// ========================================
// レイヤーID 型
// ========================================

export type HazardLayerId =
  | 'hazard_flood-layer'
  | 'hazard_hightide-layer'
  | 'hazard_tsunami-layer'
  | 'hazard_doseki-layer'
  | 'hazard_kyukeisha-layer'
  | 'hazard_jisuberi-layer'

export type SkhbLayerId =
  | 'skhb-1-layer'
  | 'skhb-2-layer'
  | 'skhb-3-layer'
  | 'skhb-4-layer'
  | 'skhb-5-layer'
  | 'skhb-6-layer'
  | 'skhb-7-layer'
  | 'skhb-8-layer'

export const DISASTER_LABELS: Record<number, string> = {
  1: '洪水',
  2: '崖崩れ/土石流/地滑り',
  3: '高潮',
  4: '地震',
  5: '津波',
  6: '大規模な火事',
  7: '内水氾濫',
  8: '火山現象',
} as const

export const SKHB_LAYER_IDS: SkhbLayerId[] = [
  'skhb-1-layer',
  'skhb-2-layer',
  'skhb-3-layer',
  'skhb-4-layer',
  'skhb-5-layer',
  'skhb-6-layer',
  'skhb-7-layer',
  'skhb-8-layer',
] as const

// ========================================
// 位置情報型
// ========================================

export type UserLocation = [longitude: number, latitude: number] | null

export interface GeolocateEventData {
  coords: {
    longitude: number
    latitude: number
    accuracy: number
    altitude: number | null
    altitudeAccuracy: number | null
    heading: number | null
    speed: number | null
  }
  timestamp: number
}

// ========================================
// マップ設定型・定数
// ========================================

export interface UseMapReturn {
  map: Ref<MaplibreMap | null>
}

export const MAP_INIT_CONFIG = {
  zoom: 5,
  center: [138, 37] as [number, number],
  minZoom: 5,
  maxZoom: 18,
  maxBounds: [122, 20, 154, 50] as [number, number, number, number],
} as const

// ========================================
// ハザードマップ定義型・定数
// ========================================

export interface HazardLayerDefinition {
  id: HazardLayerId
  label: string
  tileUrl: string
}

export const HAZARD_LAYER_DEFINITIONS: HazardLayerDefinition[] = [
  {
    id: 'hazard_flood-layer',
    label: '洪水浸水想定区域',
    tileUrl: 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',
  },
  {
    id: 'hazard_hightide-layer',
    label: '高潮浸水想定区域',
    tileUrl: 'https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png',
  },
  {
    id: 'hazard_tsunami-layer',
    label: '津波浸水想定区域',
    tileUrl: 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
  },
  {
    id: 'hazard_doseki-layer',
    label: '土石流警戒区域',
    tileUrl: 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png',
  },
  {
    id: 'hazard_kyukeisha-layer',
    label: '急傾斜地崩壊警戒区域',
    tileUrl: 'https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png',
  },
  {
    id: 'hazard_jisuberi-layer',
    label: '地滑り警戒区域',
    tileUrl: 'https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png',
  },
] as const

// ========================================
// composable 戻り値型
// ========================================

export interface UseShelterLayersReturn {
  getCurrentLayerFilter: () => FilterSpecification | null
}

export interface UseGeolocationReturn {
  userLocation: Ref<UserLocation>
}

export type NearestFeatureResult = SkhbFeatureWithDistance | null

// ========================================
// ShelterPopup コンポーネント Props 型
// ========================================

export interface ShelterPopupProps {
  properties: SkhbProperties
}

// ========================================
// PWA マニフェスト型
// ========================================

export interface PwaManifest {
  name: string
  short_name: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  background_color: string
  theme_color: string
  icons: Array<{
    src: string
    sizes: string
    type: string
  }>
}

// ========================================
// ベクトルタイル メタデータ型
// ========================================

export interface VectorTileMetadata {
  attribution: string
  description: string
  format: 'pbf'
  generator: string
  maxzoom: number
  minzoom: number
  name: string
  type: 'overlay' | 'baselayer'
  vector_layers: Array<{
    id: string
    fields: Record<string, 'String' | 'Boolean' | 'Number'>
    geometry: 'Point' | 'LineString' | 'Polygon'
    minzoom: number
    maxzoom: number
  }>
}
