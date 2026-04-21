import { assertBasemapType } from './basemap-types.js';
import { getAttributionText } from './attribution-rules.js';

export function createDisplayState(initialBasemap) {
    const basemapType = assertBasemapType(initialBasemap);
    return {
        activeBasemap: basemapType,
        activeAttribution: getAttributionText(basemapType),
        lastUpdatedAt: Date.now(),
    };
}

export function nextDisplayState(currentState, requestedBasemap) {
    const basemapType = assertBasemapType(requestedBasemap);
    if (currentState.activeBasemap === basemapType) {
        return { changed: false, state: currentState };
    }

    const nextState = {
        activeBasemap: basemapType,
        activeAttribution: getAttributionText(basemapType),
        lastUpdatedAt: Date.now(),
    };
    return { changed: true, state: nextState };
}

export function ensureConsistentState(state) {
    return state.activeAttribution === getAttributionText(state.activeBasemap);
}
