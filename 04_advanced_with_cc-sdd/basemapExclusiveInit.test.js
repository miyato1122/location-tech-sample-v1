/**
 * 排他初期表示テスト
 * カタログ内で visibility:'visible' が1件のみであることを検証する
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BASEMAP_CATALOG } from './basemapCatalog.js';

test('初期表示で visible な背景地図レイヤーはちょうど1件である', () => {
    const visibleLayers = BASEMAP_CATALOG.filter(
        (item) => item.layer.layout?.visibility === 'visible',
    );
    assert.equal(
        visibleLayers.length,
        1,
        `visibility:'visible' なレイヤーは1件であること。実際: ${visibleLayers.length}`,
    );
});

test('初期表示される背景地図は osm である', () => {
    const visibleItem = BASEMAP_CATALOG.find(
        (item) => item.layer.layout?.visibility === 'visible',
    );
    assert.equal(visibleItem?.id, 'osm');
});

test('非表示の背景地図は visibility:none を持つ', () => {
    const hiddenItems = BASEMAP_CATALOG.filter(
        (item) => item.layer.layout?.visibility !== 'visible',
    );
    assert.equal(hiddenItems.length, 4);
    for (const item of hiddenItems) {
        assert.equal(item.layer.layout?.visibility, 'none');
    }
});
