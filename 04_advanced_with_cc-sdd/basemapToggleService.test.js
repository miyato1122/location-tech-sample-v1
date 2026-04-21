/**
 * BasemapToggleService の単体テスト
 * MapLibre map インスタンスをモックで差し替えて検証する
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBasemapToggleService } from './basemapToggleService.js';
import { BASEMAP_CATALOG } from './basemapCatalog.js';

/** MapLibre map の最小モック */
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

test('初期状態は osm が現在背景である', () => {
    const map = createMapMock();
    const svc = createBasemapToggleService(map);
    assert.equal(svc.getCurrentBasemap(), 'osm');
});

test('有効な背景IDに切り替えると changed:true が返る', () => {
    const map = createMapMock();
    const svc = createBasemapToggleService(map);
    const result = svc.switchBasemap('gsiStd');
    assert.equal(result.changed, true);
    assert.equal(result.current, 'gsiStd');
});

test('切り替え後は対象レイヤーのみ visible になる', () => {
    const map = createMapMock();
    const svc = createBasemapToggleService(map);
    svc.switchBasemap('gsiStd');
    for (const item of BASEMAP_CATALOG) {
        const expected = item.id === 'gsiStd' ? 'visible' : 'none';
        assert.equal(
            map.getLayoutProperty(item.layerId, 'visibility'),
            expected,
            `${item.layerId} の visibility が ${expected} であること`,
        );
    }
});

test('無効な背景IDを渡すと changed:false で現在状態が維持される', () => {
    const map = createMapMock();
    const svc = createBasemapToggleService(map);
    const result = svc.switchBasemap('unknownId');
    assert.equal(result.changed, false);
    assert.equal(result.current, 'osm');
    assert.equal(result.reason, 'invalid-target');
});

test('同じ背景IDを再選択すると changed:false が返る', () => {
    const map = createMapMock();
    const svc = createBasemapToggleService(map);
    const result = svc.switchBasemap('osm');
    assert.equal(result.changed, false);
    assert.equal(result.current, 'osm');
});

test('切り替え後に getCurrentBasemap が更新される', () => {
    const map = createMapMock();
    const svc = createBasemapToggleService(map);
    svc.switchBasemap('gsiPhoto');
    assert.equal(svc.getCurrentBasemap(), 'gsiPhoto');
});
