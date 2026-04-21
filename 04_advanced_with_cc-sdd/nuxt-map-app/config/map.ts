import type {
  HazardLayerConfig,
  HillshadeConfig,
  MapInitOptions,
  RouteLineStyle,
  ShelterLayerConfig,
  TerrainConfig,
} from '~/types/map'

export const MAP_INIT: MapInitOptions = {
  center: [138, 37],
  zoom: 5,
  minZoom: 5,
  maxZoom: 18,
  maxBounds: [122, 20, 154, 50],
}

export const HAZARD_LAYERS: HazardLayerConfig[] = [
  {
    sourceId: 'hazard_flood',
    layerId: 'hazard_flood-layer',
    tileUrl:
      'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',
    label: '洪水浸水想定区域',
    opacity: 0.7,
  },
  {
    sourceId: 'hazard_hightide',
    layerId: 'hazard_hightide-layer',
    tileUrl:
      'https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png',
    label: '高潮浸水想定区域',
    opacity: 0.7,
  },
  {
    sourceId: 'hazard_tsunami',
    layerId: 'hazard_tsunami-layer',
    tileUrl:
      'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
    label: '津波浸水想定',
    opacity: 0.7,
  },
  {
    sourceId: 'hazard_doseki',
    layerId: 'hazard_doseki-layer',
    tileUrl:
      'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki_data/{z}/{x}/{y}.png',
    label: '土石流警戒区域',
    opacity: 0.7,
  },
  {
    sourceId: 'hazard_kyukeisha',
    layerId: 'hazard_kyukeisha-layer',
    tileUrl:
      'https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki_data/{z}/{x}/{y}.png',
    label: '急傾斜地警戒区域',
    opacity: 0.7,
  },
  {
    sourceId: 'hazard_jisuberi',
    layerId: 'hazard_jisuberi-layer',
    tileUrl:
      'https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki_data/{z}/{x}/{y}.png',
    label: '地滑り警戒区域',
    opacity: 0.7,
  },
]

export const SHELTER_LAYERS: ShelterLayerConfig[] = [
  { layerId: 'skhb-flood-layer', disasterKey: 'disaster1', label: '洪水' },
  { layerId: 'skhb-hightide-layer', disasterKey: 'disaster2', label: '崖崩れ/土石流/地滑り' },
  { layerId: 'skhb-tsunami-layer', disasterKey: 'disaster3', label: '高潮' },
  { layerId: 'skhb-earthquake-layer', disasterKey: 'disaster4', label: '地震' },
  { layerId: 'skhb-tsunami2-layer', disasterKey: 'disaster5', label: '津波' },
  { layerId: 'skhb-fire-layer', disasterKey: 'disaster6', label: '大規模な火事' },
  { layerId: 'skhb-inland-layer', disasterKey: 'disaster7', label: '内水氾濫' },
  { layerId: 'skhb-volcano-layer', disasterKey: 'disaster8', label: '火山現象' },
]

export const ROUTE_LINE: RouteLineStyle = {
  color: '#33aaff',
  width: 4,
}

export const HILLSHADE_CONFIG: HillshadeConfig = {
  exaggeration: 0.2,
}

export const TERRAIN_CONFIG: TerrainConfig = {
  exaggeration: 1,
}

export const getSkhbTileUrl = (baseURL: string): string =>
  `${baseURL}skhb/{z}/{x}/{y}.pbf`
