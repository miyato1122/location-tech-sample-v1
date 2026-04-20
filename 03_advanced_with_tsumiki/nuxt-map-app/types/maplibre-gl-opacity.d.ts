declare module 'maplibre-gl-opacity' {
  import type { Map, IControl } from 'maplibre-gl'

  interface OpacityControlOptions {
    baseLayers?: Record<string, string>
    overLayers?: Record<string, string>
    opacityControl?: boolean
  }

  class OpacityControl implements IControl {
    constructor(options: OpacityControlOptions)
    onAdd(map: Map): HTMLElement
    onRemove(): void
  }

  export default OpacityControl
  export { OpacityControl }
}
