import { BASEMAP_TYPES } from './basemap-types.js';

export const BASEMAP_LABELS = Object.freeze({
    [BASEMAP_TYPES.OSM]: 'OpenStreetMap',
    [BASEMAP_TYPES.GSI_STD]: '地理院地図',
    [BASEMAP_TYPES.GSI_ORTHO]: '航空写真',
});

export const BASEMAP_ATTRIBUTIONS = Object.freeze({
    [BASEMAP_TYPES.OSM]:
        '出典: OpenStreetMap contributors',
    [BASEMAP_TYPES.GSI_STD]:
        '出典: 国土地理院 地理院地図',
    [BASEMAP_TYPES.GSI_ORTHO]:
        '出典: 国土地理院 航空写真',
});

export function getAttributionText(basemapType) {
    const text = BASEMAP_ATTRIBUTIONS[basemapType];
    if (!text) {
        throw new Error(`Attribution not defined for ${basemapType}`);
    }
    return text;
}
