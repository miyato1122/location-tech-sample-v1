/**
 * 継続性統合テスト
 * 背景切り替え前後で既存機能レイヤー（ハザード/避難施設/ルート）の
 * visibility が変更されないことを検証する
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBasemapToggleService } from './basemapToggleService.js';
import { BASEMAP_CATALOG } from './basemapCatalog.js';

/** 既存機能レイヤーID（basemap-switcher のスコープ外） */
const EXISTING_LAYER_IDS = [
    'hazard_flood-layer',
    'hazard_hightide-layer',
    'hazard_tsunami-layer',
    'hazard_doseki-layer',
    'hazard_kyukeisha-layer',
    'hazard_jisuberi-layer',
    'skhb-1-layer',
    'skhb-2-layer',
    'skhb-3-layer',
    'skhb-4-layer',
    'skhb-5-layer',
    'skhb-6-layer',
    'skhb-7-layer',
    'skhb-8-layer',
    'route-layer',
    'hillshade',
];

function createFullMapMock(existingVisible = ['hazard_flood-layer', 'skhb-1-layer']) {
    const visibility = new Map(
        BASEMAP_CATALOG.map((item) => [item.layerId, item.layer.layout.visibility]),
    );
    for (const id of EXISTING_LAYER_IDS) {
        visibility.set(id, existingVisible.includes(id) ? 'visible' : 'none');
    }
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

test('背景切り替え後もハザード表示状態が維持される（2.1: ハザード表示維持）', () => {
    const map = createFullMapMock(['hazard_flood-layer']);
    const svc = createBasemapToggleService(map);

    svc.switchBasemap('gsiStd');

    assert.equal(map.getLayoutProperty('hazard_flood-layer', 'visibility'), 'visible');
    assert.equal(map.getLayoutProperty('hazard_hightide-layer', 'visibility'), 'none');
});

test('背景切り替え後も避難施設表示状態が維持される（2.2: 避難施設表示維持）', () => {
    const map = createFullMapMock(['skhb-3-layer']);
    const svc = createBasemapToggleService(map);

    svc.switchBasemap('gsiPhoto');

    assert.equal(map.getLayoutProperty('skhb-3-layer', 'visibility'), 'visible');
    assert.equal(map.getLayoutProperty('skhb-1-layer', 'visibility'), 'none');
});

test('背景切り替え後もルートレイヤーが影響を受けない（2.3/2.4: 現在地ルート・再読み込みなし）', () => {
    const map = createFullMapMock(['route-layer']);
    const svc = createBasemapToggleService(map);

    svc.switchBasemap('gsiStd');

    assert.equal(map.getLayoutProperty('route-layer', 'visibility'), 'visible');
});

test('背景切り替えは背景レイヤーのみを変更する（境界不変制約）', () => {
    const map = createFullMapMock(['hazard_flood-layer', 'skhb-1-layer', 'route-layer']);
    const svc = createBasemapToggleService(map);

    const before = new Map(
        EXISTING_LAYER_IDS.map((id) => [id, map.getLayoutProperty(id, 'visibility')]),
    );

    svc.switchBasemap('gsiStd');
    svc.switchBasemap('gsiPhoto');
    svc.switchBasemap('osm');

    for (const id of EXISTING_LAYER_IDS) {
        assert.equal(
            map.getLayoutProperty(id, 'visibility'),
            before.get(id),
            `${id} は切り替え後も変わらないこと`,
        );
    }
});
