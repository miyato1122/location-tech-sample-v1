declare module 'maplibre-gl-gsi-terrain' {
  import type { RasterDEMSourceSpecification } from 'maplibre-gl'

  interface GsiTerrainSourceOptions {
    tileUrl?: string
    minzoom?: number
    maxzoom?: number
    attribution?: string
  }

  function useGsiTerrainSource(options?: GsiTerrainSourceOptions): RasterDEMSourceSpecification

  export { useGsiTerrainSource }
}
