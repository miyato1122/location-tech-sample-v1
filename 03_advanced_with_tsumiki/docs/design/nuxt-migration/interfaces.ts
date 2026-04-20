/**
 * nuxt-migration 型定義
 *
 * 作成日: 2026-04-20
 * 関連設計: architecture.md
 * 移行元: docs/design/disaster-prevention-map/interfaces.ts
 *
 * 信頼性レベル:
 * - 🔵 青信号: EARS要件定義書・設計文書・既存実装を参考にした確実な型定義
 * - 🟡 黄信号: EARS要件定義書・設計文書・既存実装から妥当な推測による型定義
 * - 🔴 赤信号: EARS要件定義書・設計文書・既存実装にない推測による型定義
 *
 * 配置場所: types/index.ts
 */

import type { Ref } from 'vue'
import type { Map as MaplibreMap, FilterSpecification } from 'maplibre-gl'
import type { Feature, Point } from 'geojson'

// ========================================
// ベクトルタイル フィーチャー型
// ========================================

/**
 * 指定緊急避難場所（SKHB）フィーチャーのプロパティ
 * 🔵 信頼性: 既存 interfaces.ts + public/skhb/metadata.json より
 */
export interface SkhbProperties {
  /** 施設名称 */
  name: string // 🔵 既存interfaces.tsより
  /** 住所 */
  address: string // 🔵 既存interfaces.tsより
  /** 備考・利用条件（null の場合あり） */
  remarks: string | null // 🔵 既存interfaces.tsより（nullableに注意）
  /** 洪水対応 */
  disaster1: boolean // 🔵 既存interfaces.tsより
  /** 崖崩れ・土石流・地滑り対応 */
  disaster2: boolean // 🔵 既存interfaces.tsより
  /** 高潮対応 */
  disaster3: boolean // 🔵 既存interfaces.tsより
  /** 地震対応 */
  disaster4: boolean // 🔵 既存interfaces.tsより
  /** 津波対応 */
  disaster5: boolean // 🔵 既存interfaces.tsより
  /** 大規模な火事対応 */
  disaster6: boolean // 🔵 既存interfaces.tsより
  /** 内水氾濫対応 */
  disaster7: boolean // 🔵 既存interfaces.tsより
  /** 火山現象対応 */
  disaster8: boolean // 🔵 既存interfaces.tsより
}

/**
 * 距離計算後の避難場所フィーチャー
 * getNearestFeature() の戻り値型
 * 🔵 信頼性: 既存 interfaces.ts + REQ-052より
 */
export interface SkhbFeatureWithDistance extends Feature<Point, SkhbProperties> {
  properties: SkhbProperties & {
    /** 現在地からの距離（km） */
    dist: number // 🔵 既存interfaces.tsより
  }
}

// ========================================
// レイヤーID 型
// ========================================

/**
 * ハザードマップレイヤーID（6種）
 * 🔵 信頼性: 既存 interfaces.ts + main.js:133-174より
 */
export type HazardLayerId =
  | 'hazard_flood-layer'      // 洪水浸水想定区域
  | 'hazard_hightide-layer'   // 高潮浸水想定区域
  | 'hazard_tsunami-layer'    // 津波浸水想定区域
  | 'hazard_doseki-layer'     // 土石流警戒区域
  | 'hazard_kyukeisha-layer'  // 急傾斜地崩壊警戒区域
  | 'hazard_jisuberi-layer'   // 地滑り警戒区域

/**
 * 指定緊急避難場所レイヤーID（8種）
 * 🔵 信頼性: 既存 interfaces.ts + main.js:187-363より
 */
export type SkhbLayerId =
  | 'skhb-1-layer'  // 洪水
  | 'skhb-2-layer'  // 崖崩れ・土石流・地滑り
  | 'skhb-3-layer'  // 高潮
  | 'skhb-4-layer'  // 地震
  | 'skhb-5-layer'  // 津波
  | 'skhb-6-layer'  // 大規模な火事
  | 'skhb-7-layer'  // 内水氾濫
  | 'skhb-8-layer'  // 火山現象

/**
 * 災害種別ラベルマッピング（ShelterPopup表示用）
 * 🔵 信頼性: 既存実装 main.js:480-512より
 */
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

/**
 * 全避難場所レイヤーIDの配列（定数）
 * 🔵 信頼性: 既存実装より
 */
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

/**
 * ユーザー現在地座標
 * null は位置情報未取得状態を表す
 * 🔵 信頼性: 既存 interfaces.ts + REQ-040より
 */
export type UserLocation = [longitude: number, latitude: number] | null

/**
 * GeolocateControl イベントデータ
 * 🔵 信頼性: 既存 interfaces.ts + main.js:422-424より
 */
export interface GeolocateEventData {
  coords: {
    longitude: number // 🔵 既存interfaces.tsより
    latitude: number // 🔵 既存interfaces.tsより
    accuracy: number // 🔵 既存interfaces.tsより
    altitude: number | null // 🔵 既存interfaces.tsより
    altitudeAccuracy: number | null // 🔵 既存interfaces.tsより
    heading: number | null // 🔵 既存interfaces.tsより
    speed: number | null // 🔵 既存interfaces.tsより
  }
  timestamp: number // 🔵 既存interfaces.tsより
}

// ========================================
// マップ設定型
// ========================================

/**
 * useMap composable の戻り値型
 * 🔵 信頼性: REQ-010 + アーキテクチャ設計より
 */
export interface UseMapReturn {
  /** MapLibreマップインスタンス */
  map: Ref<MaplibreMap | null> // 🔵 REQ-010より
}

/**
 * MapLibre GL JS マップ初期化設定（定数）
 * 🔵 信頼性: 既存実装 main.js:15-32より
 */
export const MAP_INIT_CONFIG = {
  zoom: 5,
  center: [138, 37] as [number, number],
  minZoom: 5,
  maxZoom: 18,
  maxBounds: [122, 20, 154, 50] as [number, number, number, number],
} as const

// ========================================
// ハザードマップ定義型
// ========================================

/**
 * ハザードマップレイヤーの定義
 * 🔵 信頼性: 既存実装 main.js:35-100より
 */
export interface HazardLayerDefinition {
  /** レイヤーID */
  id: HazardLayerId // 🔵 既存interfaces.tsより
  /** 表示ラベル（OpacityControl用） */
  label: string // 🔵 既存実装より
  /** GSIタイルサーバーURL（{z}/{x}/{y}形式） */
  tileUrl: string // 🔵 既存実装より
}

/**
 * ハザードマップレイヤー定義一覧（定数）
 * 🔵 信頼性: 既存実装 main.js:35-100より
 */
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

/**
 * useShelterLayers composable の戻り値型
 * 🔵 信頼性: REQ-030, REQ-031 + アーキテクチャ設計より
 */
export interface UseShelterLayersReturn {
  /** 現在表示中の避難場所レイヤーのフィルター式を返す関数 */
  getCurrentLayerFilter: () => FilterSpecification | null // 🔵 REQ-031より
}

/**
 * useGeolocation composable の戻り値型
 * 🔵 信頼性: REQ-040 + アーキテクチャ設計より
 */
export interface UseGeolocationReturn {
  /** ユーザーの現在地（null=未取得） */
  userLocation: Ref<UserLocation> // 🔵 REQ-040より
}

/**
 * getNearestFeature 関数の戻り値型
 * EDGE-101修正後はnullを安全に返す
 * 🔵 信頼性: REQ-052 + 既存interfaces.tsより
 */
export type NearestFeatureResult = SkhbFeatureWithDistance | null

// ========================================
// ShelterPopup コンポーネント Props 型
// ========================================

/**
 * ShelterPopup.vue の props 型定義
 * createApp(ShelterPopup, props) で使用
 * 🔵 信頼性: REQ-060 + アーキテクチャ設計（createApp方式）より
 */
export interface ShelterPopupProps {
  /** 避難場所フィーチャーのプロパティ */
  properties: SkhbProperties // 🔵 REQ-060より
}

// ========================================
// PWA マニフェスト型（参照用）
// ========================================

/**
 * @vite-pwa/nuxt のPWA設定型（nuxt.config.ts用）
 * 🔵 信頼性: REQ-080 + 既存 public/manifest.json より
 */
export interface PwaManifest {
  name: string // 🔵 既存manifest.jsonより
  short_name: string // 🔵 既存manifest.jsonより
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser' // 🔵 既存manifest.jsonより
  background_color: string // 🔵 既存manifest.jsonより
  theme_color: string // 🔵 既存manifest.jsonより
  icons: Array<{
    src: string
    sizes: string
    type: string
  }> // 🔵 既存manifest.jsonより
}

// ========================================
// ベクトルタイル メタデータ型
// ========================================

/**
 * Tippecanoe 生成のベクトルタイルメタデータ
 * public/skhb/metadata.json の型
 * 🔵 信頼性: 既存 interfaces.ts + public/skhb/metadata.json より
 */
export interface VectorTileMetadata {
  attribution: string // 🔵 既存interfaces.tsより
  description: string // 🔵 既存interfaces.tsより
  format: 'pbf' // 🔵 既存interfaces.tsより
  generator: string // 🔵 既存interfaces.tsより
  maxzoom: number // 🔵 既存interfaces.tsより
  minzoom: number // 🔵 既存interfaces.tsより
  name: string // 🔵 既存interfaces.tsより
  type: 'overlay' | 'baselayer' // 🔵 既存interfaces.tsより
  vector_layers: Array<{
    id: string
    fields: Record<string, 'String' | 'Boolean' | 'Number'>
    geometry: 'Point' | 'LineString' | 'Polygon'
    minzoom: number
    maxzoom: number
  }> // 🔵 既存interfaces.tsより
}

// ========================================
// 信頼性レベルサマリー
// ========================================
/**
 * - 🔵 青信号: 全型定義項目（100%）
 * - 🟡 黄信号: 0件
 * - 🔴 赤信号: 0件
 *
 * 品質評価: ✅ 高品質
 * （既存 interfaces.ts + 要件定義 + ユーザーヒアリングに基づく）
 */
