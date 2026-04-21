/**
 * 背景地図失敗時安定状態維持のテスト
 * BasemapToggleService が BasemapErrorChannel と連携して
 * 失敗時に直前背景を維持することを検証する
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBasemapToggleService } from './basemapToggleService.js';
import { createBasemapErrorChannel } from './basemapErrorChannel.js';
import { BASEMAP_CATALOG } from './basemapCatalog.js';

function createMapMock() {
    const visibility = new Map(
        BASEMAP_CATALOG.map((item) => [item.layerId, item.layer.layout.visibility]),
    );
    return {
        setLayoutProperty(layerId, prop, value) {
            if (prop === 'visibility') visibility.set(layerId, value);
        },
        getLayoutProperty(layerId, prop) {
            if (prop === 'visibility') return visibility.get(layerId);
        },
        _visibility: visibility,
    };
}

test('notifyError を呼ぶとエラーチャネルに失敗状態が反映される', () => {
    const map = createMapMock();
    const channel = createBasemapErrorChannel();
    const svc = createBasemapToggleService(map, channel);

    svc.notifyError('osm-layer', 'タイル取得失敗');

    const state = channel.getState();
    assert.equal(state.hasError, true);
    assert.equal(state.layerId, 'osm-layer');
});

test('notifyError 後も getCurrentBasemap は変わらない', () => {
    const map = createMapMock();
    const channel = createBasemapErrorChannel();
    const svc = createBasemapToggleService(map, channel);

    svc.switchBasemap('gsiStd');
    svc.notifyError('gsi-std-layer', '読み込み失敗');

    assert.equal(svc.getCurrentBasemap(), 'gsiStd');
});

test('notifyRecovery を呼ぶとエラーチャネルがクリアされる', () => {
    const map = createMapMock();
    const channel = createBasemapErrorChannel();
    const svc = createBasemapToggleService(map, channel);

    svc.notifyError('osm-layer', '失敗');
    svc.notifyRecovery();

    const state = channel.getState();
    assert.equal(state.hasError, false);
});
