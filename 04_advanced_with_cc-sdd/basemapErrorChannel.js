/**
 * 背景地図失敗状態チャネル
 * 制御ロジックとUIが共通で読める失敗状態の受け渡し契約を提供する
 */

/**
 * @typedef {Object} BasemapErrorState
 * @property {boolean} hasError
 * @property {string|null} layerId
 * @property {string|null} message
 */

/**
 * @typedef {Object} BasemapErrorChannel
 * @property {() => BasemapErrorState} getState
 * @property {(layerId: string, message: string) => void} setError
 * @property {() => void} clearError
 * @property {(listener: () => void) => () => void} subscribe
 */

/**
 * 失敗状態チャネルを生成して返す
 * @returns {BasemapErrorChannel}
 */
export function createBasemapErrorChannel() {
    /** @type {BasemapErrorState} */
    let state = {
        hasError: false,
        layerId: null,
        message: null,
    };

    /** @type {Set<() => void>} */
    const listeners = new Set();

    const notify = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    return {
        getState() {
            return { ...state };
        },
        setError(layerId, message) {
            state = { hasError: true, layerId, message };
            notify();
        },
        clearError() {
            state = { hasError: false, layerId: null, message: null };
            notify();
        },
        /**
         * @param {() => void} listener
         * @returns {() => void} unsubscribe
         */
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
