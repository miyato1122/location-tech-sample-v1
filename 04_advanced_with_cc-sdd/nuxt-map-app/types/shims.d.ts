declare module 'maplibre-gl-opacity' {
  interface OpacityControlOptions {
    baseLayers: Record<string, string>
    opacityControl?: boolean
  }
  class OpacityControl {
    constructor(options: OpacityControlOptions)
    onAdd(map: unknown): HTMLElement
    onRemove(): void
  }
  export default OpacityControl
}

declare module 'maplibre-gl-gsi-terrain' {
  export function useGsiTerrainSource(addProtocol: unknown): {
    type: 'raster-dem'
    tiles: string[]
    tileSize: number
    minzoom: number
    maxzoom: number
    attribution: string
  }
}

declare module '@turf/distance' {
  type Position = number[]
  type Coord = Position | { type: string; coordinates: Position }
  function distance(from: Coord, to: Coord, options?: { units?: string }): number
  export default distance
}

declare module 'maplibre-gl' {
  interface GeolocateControl {
    _watchState: 'OFF' | 'ACTIVE_LOCK' | 'BACKGROUND'
  }
}
