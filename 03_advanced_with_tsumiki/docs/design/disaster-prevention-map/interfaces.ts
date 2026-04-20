/**
 * 防災マップ 型定義集（逆生成）
 * 分析日時: 2026-04-20
 *
 * 現在のアプリケーションは Vanilla JavaScript で実装されているため、
 * 明示的な型定義は存在しない。本ファイルは実装から推定した型定義である。
 * TypeScript への移行時の参照として使用する。
 */

// ======================
// ベクトルタイル フィーチャー型
// ======================

/**
 * 指定緊急避難場所（SKHB）フィーチャーのプロパティ
 * ソース: public/skhb/metadata.json
 */
export interface SkhbProperties {
  /** 施設名称 */
  name: string;
  /** 住所 */
  address: string;
  /** 備考・利用条件（null の場合あり） */
  remarks: string | null;
  /** 洪水対応 */
  disaster1: boolean;
  /** 崖崩れ・土石流・地滑り対応 */
  disaster2: boolean;
  /** 高潮対応 */
  disaster3: boolean;
  /** 地震対応 */
  disaster4: boolean;
  /** 津波対応 */
  disaster5: boolean;
  /** 大規模な火事対応 */
  disaster6: boolean;
  /** 内水氾濫対応 */
  disaster7: boolean;
  /** 火山現象対応 */
  disaster8: boolean;
}

/**
 * 距離計算後の避難場所フィーチャー
 * main.js:396-410 の getNearestFeature() 戻り値
 */
export interface SkhbFeatureWithDistance extends GeoJSON.Feature<GeoJSON.Point, SkhbProperties> {
  properties: SkhbProperties & {
    /** 現在地からの距離（km） */
    dist: number;
  };
}

// ======================
// マップ設定型
// ======================

/**
 * MapLibre GL JS マップ初期化設定
 * main.js:15-21
 */
export interface MapInitConfig {
  container: string;
  zoom: number;
  center: [longitude: number, latitude: number];
  minZoom: number;
  maxZoom: number;
  maxBounds: [west: number, south: number, east: number, north: number];
}

/**
 * ハザードマップレイヤー定義
 * main.js:35-100
 */
export interface HazardLayerDefinition {
  id: HazardLayerId;
  label: string;
  tileUrl: string;
}

/** ハザードマップレイヤーID */
export type HazardLayerId =
  | 'hazard_flood-layer'
  | 'hazard_hightide-layer'
  | 'hazard_tsunami-layer'
  | 'hazard_doseki-layer'
  | 'hazard_kyukeisha-layer'
  | 'hazard_jisuberi-layer';

/**
 * 指定緊急避難場所レイヤーID
 * disaster1〜8 に対応
 */
export type SkhbLayerId =
  | 'skhb-1-layer'
  | 'skhb-2-layer'
  | 'skhb-3-layer'
  | 'skhb-4-layer'
  | 'skhb-5-layer'
  | 'skhb-6-layer'
  | 'skhb-7-layer'
  | 'skhb-8-layer';

/**
 * 災害種別とレイヤーIDのマッピング
 */
export interface DisasterLayerMap {
  'skhb-1-layer': '洪水';
  'skhb-2-layer': '崖崩れ/土石流/地滑り';
  'skhb-3-layer': '高潮';
  'skhb-4-layer': '地震';
  'skhb-5-layer': '津波';
  'skhb-6-layer': '大規模な火事';
  'skhb-7-layer': '内水氾濫';
  'skhb-8-layer': '火山現象';
}

// ======================
// 位置情報型
// ======================

/**
 * ユーザー現在地座標
 * null は位置情報未取得状態を表す
 * main.js:415 の userLocation 変数の型
 */
export type UserLocation = [longitude: number, latitude: number] | null;

/**
 * GeolocateControl イベントデータ
 * main.js:422-424
 */
export interface GeolocateEventData {
  coords: {
    longitude: number;
    latitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

// ======================
// GeoJSON 型
// ======================

/**
 * ルートライン（現在地〜最寄り避難場所）の GeoJSON
 * main.js:561-571
 */
export interface RouteFeatureCollection extends GeoJSON.FeatureCollection<GeoJSON.LineString> {
  features: Array<GeoJSON.Feature<GeoJSON.LineString>>;
}

// ======================
// PWA 型
// ======================

/**
 * PWA マニフェスト
 * public/manifest.json
 */
export interface PwaManifest {
  theme_color: string;
  background_color: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  scope: string;
  start_url: string;
  name: string;
  short_name: string;
  orientation: 'portrait' | 'landscape' | 'any';
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

// ======================
// ベクトルタイル メタデータ型
// ======================

/**
 * Tippecanoe 生成のベクトルタイルメタデータ
 * public/skhb/metadata.json
 */
export interface VectorTileMetadata {
  attribution: string;
  description: string;
  format: 'pbf';
  generator: string;
  maxzoom: number;
  minzoom: number;
  name: string;
  type: 'overlay' | 'baselayer';
  vector_layers: Array<{
    id: string;
    fields: Record<string, 'String' | 'Boolean' | 'Number'>;
    geometry: 'Point' | 'LineString' | 'Polygon';
    minzoom: number;
    maxzoom: number;
  }>;
}

// ======================
// 関数シグネチャ型
// ======================

/**
 * getCurrentSkhbLayerFilter の戻り値型
 * MapLibre GL JS フィルター式
 * main.js:371-382
 */
export type MaplibreFilterExpression = ['get', keyof Pick<SkhbProperties, `disaster${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`>];

/**
 * getNearestFeature の戻り値型
 * main.js:387-413
 */
export type NearestFeatureResult = SkhbFeatureWithDistance | null;
