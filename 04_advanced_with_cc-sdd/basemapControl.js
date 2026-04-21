/**
 * 背景地図セレクターコントロール
 * 左下UIでの選択操作と選択中状態の視覚的区別を担当する
 */
import { BASEMAP_CATALOG } from './basemapCatalog.js';

/**
 * @param {object} opts
 * @param {HTMLElement} opts.container - basemap-control コンテナ
 * @param {HTMLElement} opts.attributionEl - basemap-attribution エリア
 * @param {{ switchBasemap: (id: string) => import('./basemapToggleService.js').BasemapSwitchResult, getCurrentBasemap: () => string, notifyRecovery?: () => void }} opts.service
 */
export function mountBasemapControl({ container, attributionEl, service }) {
    // 初期状態のボタンを描画
    for (const item of BASEMAP_CATALOG) {
        const btn = document.createElement('button');
        btn.textContent = item.label;
        btn.dataset.basemapId = item.id;
        btn.className = 'basemap-control__btn';
        if (item.id === service.getCurrentBasemap()) {
            btn.classList.add('basemap-control__btn--active');
        }
        btn.addEventListener('click', () => {
            const result = service.switchBasemap(item.id);
            if (result.changed) {
                if (typeof service.notifyRecovery === 'function') {
                    service.notifyRecovery();
                }
                _updateActiveState(container, result.current);
                _updateAttribution(attributionEl, result.current);
            }
        });
        container.appendChild(btn);
    }

    // 初期出典表示
    _updateAttribution(attributionEl, service.getCurrentBasemap());
}

/**
 * @param {HTMLElement} container
 * @param {string} currentId
 */
function _updateActiveState(container, currentId) {
    for (const btn of container.querySelectorAll('.basemap-control__btn')) {
        btn.classList.toggle(
            'basemap-control__btn--active',
            btn.dataset.basemapId === currentId,
        );
    }
}

/**
 * @param {HTMLElement} el
 * @param {string} currentId
 */
function _updateAttribution(el, currentId) {
    const item = BASEMAP_CATALOG.find((c) => c.id === currentId);
    if (item) el.textContent = item.attributionText;
}
