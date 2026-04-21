/**
 * 背景地図切り替えサービス
 * 背景レイヤーを排他制御し、既存機能状態を維持する
 */
import { BASEMAP_CATALOG, BASEMAP_BY_ID } from './basemapCatalog.js';

/**
 * @typedef {'osm'|'gsiStd'|'gsiPhoto'} BasemapId
 * @typedef {{ changed: boolean, current: BasemapId, reason?: string }} BasemapSwitchResult
 */

/**
 * BasemapToggleService を生成して返す
 * @param {import('maplibre-gl').Map} map
 * @returns {{ switchBasemap: (target: string) => BasemapSwitchResult, getCurrentBasemap: () => BasemapId }}
 */
export function createBasemapToggleService(map) {
    let currentId = /** @type {BasemapId} */ ('osm');

    /**
     * 背景地図を排他切り替えする
     * @param {string} target
     * @returns {BasemapSwitchResult}
     */
    function switchBasemap(target) {
        if (!BASEMAP_BY_ID[target]) {
            return { changed: false, current: currentId, reason: 'invalid-target' };
        }
        if (target === currentId) {
            return { changed: false, current: currentId };
        }

        // 排他切り替え: 全背景レイヤーを none → 選択対象のみ visible
        for (const item of BASEMAP_CATALOG) {
            map.setLayoutProperty(
                item.layerId,
                'visibility',
                item.id === target ? 'visible' : 'none',
            );
        }

        currentId = /** @type {BasemapId} */ (target);
        return { changed: true, current: currentId };
    }

    function getCurrentBasemap() {
        return currentId;
    }

    return { switchBasemap, getCurrentBasemap };
}
