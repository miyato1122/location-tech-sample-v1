export const BASEMAP_TYPES = Object.freeze({
    OSM: 'osm',
    GSI_STD: 'gsi_std',
    GSI_ORTHO: 'gsi_ortho',
});

export const BASEMAP_TYPE_LIST = Object.freeze([
    BASEMAP_TYPES.OSM,
    BASEMAP_TYPES.GSI_STD,
    BASEMAP_TYPES.GSI_ORTHO,
]);

export function isValidBasemapType(value) {
    return BASEMAP_TYPE_LIST.includes(value);
}

export function assertBasemapType(value) {
    if (!isValidBasemapType(value)) {
        throw new Error(`Unsupported basemap type: ${value}`);
    }
    return value;
}
