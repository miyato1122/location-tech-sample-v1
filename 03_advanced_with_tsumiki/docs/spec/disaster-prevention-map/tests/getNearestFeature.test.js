/**
 * getNearestFeature() 単体テスト（逆生成）
 * 参照実装: main.js:387-413
 *
 * 実行方法:
 *   npm install -D vitest @vitest/coverage-v8
 *   npx vitest run tests/getNearestFeature.test.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import distance from '@turf/distance';

// @turf/distance モック
vi.mock('@turf/distance', () => ({
    default: vi.fn(),
}));

// MapLibre GL JS のマップインスタンスモック
const mockMap = {
    getStyle: vi.fn(),
    querySourceFeatures: vi.fn(),
};

// main.js から抽出した関数（TypeScript 移行時の参照用）
// 実際のテストでは main.js をリファクタリングして export する必要がある
const getCurrentSkhbLayerFilter = () => {
    const style = mockMap.getStyle();
    const skhbLayers = style.layers.filter((layer) => layer.id.startsWith('skhb'));
    const visibleSkhbLayers = skhbLayers.filter(
        (layer) => layer.layout.visibility === 'visible',
    );
    return visibleSkhbLayers[0].filter;
};

const getNearestFeature = (longitude, latitude) => {
    const currentSkhbLayerFilter = getCurrentSkhbLayerFilter();
    const features = mockMap.querySourceFeatures('skhb', {
        sourceLayer: 'skhb',
        filter: currentSkhbLayerFilter,
    });

    const nearestFeature = features.reduce((minDistFeature, feature) => {
        const dist = distance(
            [longitude, latitude],
            feature.geometry.coordinates,
        );
        if (minDistFeature === null || minDistFeature.properties.dist > dist)
            return { ...feature, properties: { ...feature.properties, dist } };
        return minDistFeature;
    }, null);

    return nearestFeature;
};

// テストデータ
const makeFeature = (lng, lat, name) => ({
    geometry: { coordinates: [lng, lat] },
    properties: { name, disaster1: true },
});

describe('getCurrentSkhbLayerFilter()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('TC-005: 表示中の skhb-4-layer のフィルター条件を返す', () => {
        mockMap.getStyle.mockReturnValue({
            layers: [
                { id: 'skhb-1-layer', layout: { visibility: 'none' }, filter: ['get', 'disaster1'] },
                { id: 'skhb-2-layer', layout: { visibility: 'none' }, filter: ['get', 'disaster2'] },
                { id: 'skhb-4-layer', layout: { visibility: 'visible' }, filter: ['get', 'disaster4'] },
                { id: 'skhb-5-layer', layout: { visibility: 'none' }, filter: ['get', 'disaster5'] },
                { id: 'osm-layer', layout: { visibility: 'visible' } }, // 非skhbレイヤー（除外されるべき）
            ],
        });

        const filter = getCurrentSkhbLayerFilter();
        expect(filter).toEqual(['get', 'disaster4']);
    });

    it('表示中のレイヤーが skhb-1-layer のとき disaster1 フィルターを返す', () => {
        mockMap.getStyle.mockReturnValue({
            layers: [
                { id: 'skhb-1-layer', layout: { visibility: 'visible' }, filter: ['get', 'disaster1'] },
                { id: 'skhb-2-layer', layout: { visibility: 'none' }, filter: ['get', 'disaster2'] },
            ],
        });

        const filter = getCurrentSkhbLayerFilter();
        expect(filter).toEqual(['get', 'disaster1']);
    });
});

describe('getNearestFeature()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // 表示中レイヤーをデフォルト設定
        mockMap.getStyle.mockReturnValue({
            layers: [
                { id: 'skhb-4-layer', layout: { visibility: 'visible' }, filter: ['get', 'disaster4'] },
            ],
        });
    });

    // TC-002: フィーチャー0件時のnull返却
    it('TC-002: フィーチャーが0件の場合 null を返す', () => {
        mockMap.querySourceFeatures.mockReturnValue([]);

        const result = getNearestFeature(139.0, 35.0);
        expect(result).toBeNull();
    });

    // TC-002のバグ確認: null返却後のTypeError
    it('TC-002 [バグ再現]: null返却後に _geometry.coordinates を参照するとTypeErrorが発生する', () => {
        mockMap.querySourceFeatures.mockReturnValue([]);

        const nearestFeature = getNearestFeature(139.0, 35.0);

        // このコードが main.js:568 相当のバグを再現する
        expect(() => {
            const coords = nearestFeature._geometry.coordinates; // TypeError: Cannot read properties of null
        }).toThrow(TypeError);
    });

    // TC-003: 単一フィーチャーの返却
    it('TC-003: フィーチャーが1件の場合そのフィーチャーを返す', () => {
        const featureA = makeFeature(139.0, 35.0, '施設A');
        mockMap.querySourceFeatures.mockReturnValue([featureA]);
        distance.mockReturnValue(1.5);

        const result = getNearestFeature(139.01, 35.01);

        expect(result).not.toBeNull();
        expect(result.properties.name).toBe('施設A');
        expect(result.properties.dist).toBe(1.5);
    });

    // TC-001: 複数フィーチャーから最近傍を選択
    it('TC-001: 複数フィーチャーから最も近い施設を返す', () => {
        const featureA = makeFeature(139.0, 35.0, '施設A');
        const featureB = makeFeature(139.5, 35.5, '施設B');
        const featureC = makeFeature(140.0, 36.0, '施設C');
        mockMap.querySourceFeatures.mockReturnValue([featureA, featureB, featureC]);

        // 距離をモック: 施設Bが最近傍
        distance
            .mockReturnValueOnce(5.0)  // 施設A
            .mockReturnValueOnce(2.0)  // 施設B（最近傍）
            .mockReturnValueOnce(8.0); // 施設C

        const result = getNearestFeature(139.3, 35.3);

        expect(result.properties.name).toBe('施設B');
        expect(result.properties.dist).toBe(2.0);
    });

    it('TC-001: 最初のフィーチャーが最近傍の場合も正しく返す', () => {
        const featureA = makeFeature(139.0, 35.0, '施設A');
        const featureB = makeFeature(139.5, 35.5, '施設B');
        mockMap.querySourceFeatures.mockReturnValue([featureA, featureB]);

        distance
            .mockReturnValueOnce(1.0)  // 施設A（最近傍）
            .mockReturnValueOnce(5.0); // 施設B

        const result = getNearestFeature(139.01, 35.01);

        expect(result.properties.name).toBe('施設A');
        expect(result.properties.dist).toBe(1.0);
    });

    it('querySourceFeatures に正しいフィルター条件が渡される', () => {
        mockMap.querySourceFeatures.mockReturnValue([]);

        getNearestFeature(139.0, 35.0);

        expect(mockMap.querySourceFeatures).toHaveBeenCalledWith('skhb', {
            sourceLayer: 'skhb',
            filter: ['get', 'disaster4'],
        });
    });
});
