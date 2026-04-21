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
 * @param {{ setError: (layerId: string, message: string) => void, clearError: () => void } | null} [errorChannel]
 * @returns {{ switchBasemap: (target: string) => BasemapSwitchResult, getCurrentBasemap: () => BasemapId, notifyError: (layerId: string, message: string) => void, notifyRecovery: () => void }}
 */
export function createBasemapToggleService(map, errorChannel = null) {
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

    /**
     * 背景地図の読み込み/描画失敗を通知する
     * 現在背景は変更しない（安定状態を維持）
     * @param {string} layerId
     * @param {string} message
     */
    function notifyError(layerId, message) {
        if (errorChannel) errorChannel.setError(layerId, message);
    }

    /**
     * 背景地図の回復を通知する
     */
    function notifyRecovery() {
        if (errorChannel) errorChannel.clearError();
    }

    return { switchBasemap, getCurrentBasemap, notifyError, notifyRecovery };
}

