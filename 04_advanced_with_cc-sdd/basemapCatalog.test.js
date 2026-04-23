import test from 'node:test';
import assert from 'node:assert/strict';
import { BASEMAP_CATALOG } from './basemapCatalog.js';

test('背景地図カタログは5件を提供する', () => {
    assert.equal(BASEMAP_CATALOG.length, 5);
});

test('背景地図IDは一意である', () => {
    const ids = BASEMAP_CATALOG.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
});

test('背景地図はUI表示とレイヤー定義に必要な属性を持つ', () => {
    for (const item of BASEMAP_CATALOG) {
        assert.ok(item.id);
        assert.ok(item.label);
        assert.ok(item.sourceId);
        assert.ok(item.layerId);
        assert.ok(item.source?.tiles?.length > 0);
        assert.equal(item.layer.source, item.sourceId);
    }
});
