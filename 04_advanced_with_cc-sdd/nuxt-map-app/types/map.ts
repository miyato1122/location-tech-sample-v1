// maplibre-gl の FilterSpecification に相当するカスタム型
// maplibre-gl v2.4.0 の named export が TypeScript 6.0 で取得できないため独自定義する
export type MapFilter = readonly [string, ...unknown[]] | boolean | null

export type Coordinate = [longitude: number, latitude: number]

export type DisasterKey =
  | 'disaster1'
  | 'disaster2'
  | 'disaster3'
  | 'disaster4'
  | 'disaster5'
  | 'disaster6'
  | 'disaster7'
  | 'disaster8'

export interface ShelterProperties {
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

export interface HazardLayerConfig {
  readonly sourceId: string
  readonly layerId: string
  readonly tileUrl: string
  readonly label: string
  readonly opacity: number
}

export interface ShelterLayerConfig {
  readonly layerId: string
  readonly disasterKey: DisasterKey
  readonly label: string
}

export type LayerVisibility = 'visible' | 'none'

export interface MapInitOptions {
  readonly center: Coordinate
  readonly zoom: number
  readonly minZoom: number
  readonly maxZoom: number
  readonly maxBounds: [number, number, number, number]
}

export interface RouteLineStyle {
  readonly color: string
  readonly width: number
}

export interface HillshadeConfig {
  readonly exaggeration: number
}

export interface TerrainConfig {
  readonly exaggeration: number
}

export type ShelterVisibleFilter = MapFilter | null

/** マップで取得される GeoJSON Feature の最小インターフェース */
export interface MapGeoJSONFeature {
  geometry: { type: string; coordinates: unknown }
  properties: Record<string, unknown> | null
}

/** GeoJSONSource の最小インターフェース（setData のみ使用） */
export interface GeoJSONSourceLike {
  setData(data: unknown): void
}

/** MapLibre Map インスタンスの最小インターフェース
 *  maplibre-gl v2.4.0 の型定義が TypeScript 6.0 と非互換のため、
 *  プロジェクトで使用する API に限定して独自定義する */
export interface MapInstance {
  on(event: string, handler: (...args: unknown[]) => void): this
  addControl(control: unknown, position?: string): this
  addSource(id: string, source: unknown): void
  addLayer(layer: unknown, beforeId?: string): void
  getStyle(): {
    layers: Array<{
      id: string
      layout?: Record<string, unknown>
      filter?: unknown
    }>
    sources: Record<string, unknown>
  }
  getZoom(): number
  getCanvas(): HTMLCanvasElement
  getSource(id: string): GeoJSONSourceLike | undefined
  queryRenderedFeatures(
    point: unknown,
    options?: { layers?: string[] },
  ): MapGeoJSONFeature[]
  querySourceFeatures(
    sourceId: string,
    options?: { sourceLayer?: string; filter?: unknown },
  ): MapGeoJSONFeature[]
  loaded(): boolean
  remove(): void
}
