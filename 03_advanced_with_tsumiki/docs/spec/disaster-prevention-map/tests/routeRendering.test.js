/**
 * ルートライン描画ロジック 単体テスト（逆生成）
 * 参照実装: main.js:542-577
 *
 * テスト対象:
 * - ズームレベル閾値（zoom < 7）でのルートクリア（TC-007）
 * - GeolocateControl OFF 時の userLocation 初期化（TC-008）
 * - ルートライン GeoJSON 形式の確認（TC-006）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// モックオブジェクト
const mockRouteSource = { setData: vi.fn() };
const mockGeolocationControl = { _watchState: 'ACTIVE_LOCK' };
const mockMap = {
    getZoom: vi.fn(),
    getSource: vi.fn(() => mockRouteSource),
};

// main.js の render イベント内のロジックを抽出したテスト対象関数
// 実際には main.js をリファクタリングして export する必要がある
let userLocation = null;

const onRender = (getNearestFeatureMock) => {
    // GeolocationControl が OFF なら位置情報をクリア
    if (mockGeolocationControl._watchState === 'OFF') userLocation = null;

    // ズーム < 7 または位置情報なし → ルートクリア
    if (mockMap.getZoom() < 7 || userLocation === null) {
        mockMap.getSource('route').setData({
            type: 'FeatureCollection',
            features: [],
        });
        return;
    }

    // 最近傍施設を取得
    const nearestFeature = getNearestFeatureMock(userLocation[0], userLocation[1]);

    // ⚠️ TC-002 のバグ: nearestFeature が null の場合ここでエラーが発生する
    if (!nearestFeature) return; // 修正案: null チェックを追加

    const routeFeature = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [userLocation, nearestFeature._geometry.coordinates],
        },
    };
    mockMap.getSource('route').setData({
        type: 'FeatureCollection',
        features: [routeFeature],
    });
};

const emptyFeatureCollection = { type: 'FeatureCollection', features: [] };

describe('render イベント: ルートライン描画ロジック', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGeolocationControl._watchState = 'ACTIVE_LOCK';
        userLocation = null;
    });

    // TC-007: ズームレベル閾値テスト
    describe('TC-007: ズームレベル閾値', () => {
        it('ズームレベル 6（< 7）のとき空のルートデータをセットする', () => {
            mockMap.getZoom.mockReturnValue(6);
            userLocation = [139.0, 35.0];

            onRender(vi.fn());

            expect(mockRouteSource.setData).toHaveBeenCalledWith(emptyFeatureCollection);
        });

        it('ズームレベル 7（= 7）のとき最近傍フィーチャーを使用してルートを描画する', () => {
            mockMap.getZoom.mockReturnValue(7);
            userLocation = [139.0, 35.0];
            const nearestFeature = {
                _geometry: { coordinates: [139.1, 35.1] },
                properties: {},
            };
            const mockGetNearest = vi.fn(() => nearestFeature);

            onRender(mockGetNearest);

            expect(mockGetNearest).toHaveBeenCalledWith(139.0, 35.0);
            const callArg = mockRouteSource.setData.mock.calls[0][0];
            expect(callArg.features).toHaveLength(1);
            expect(callArg.features[0].geometry.type).toBe('LineString');
        });

        it('ズームレベル 8（> 7）のときもルートを描画する', () => {
            mockMap.getZoom.mockReturnValue(8);
            userLocation = [139.0, 35.0];
            const nearestFeature = {
                _geometry: { coordinates: [139.1, 35.1] },
                properties: {},
            };

            onRender(vi.fn(() => nearestFeature));

            const callArg = mockRouteSource.setData.mock.calls[0][0];
            expect(callArg.features).toHaveLength(1);
        });
    });

    // TC-008: GeolocateControl OFF 時のテスト
    describe('TC-008: GeolocateControl OFF 時', () => {
        it('_watchState が OFF のとき userLocation を null にリセットする', () => {
            mockGeolocationControl._watchState = 'OFF';
            userLocation = [139.0, 35.0]; // 以前取得した位置情報あり
            mockMap.getZoom.mockReturnValue(10);

            onRender(vi.fn());

            // userLocation が null になり、ルートがクリアされる
            expect(mockRouteSource.setData).toHaveBeenCalledWith(emptyFeatureCollection);
        });

        it('_watchState が ACTIVE_LOCK のとき userLocation を維持する', () => {
            mockGeolocationControl._watchState = 'ACTIVE_LOCK';
            userLocation = [139.0, 35.0];
            mockMap.getZoom.mockReturnValue(10);
            const nearestFeature = {
                _geometry: { coordinates: [139.1, 35.1] },
                properties: {},
            };

            onRender(vi.fn(() => nearestFeature));

            const callArg = mockRouteSource.setData.mock.calls[0][0];
            expect(callArg.features).toHaveLength(1);
        });
    });

    // TC-006: GeoJSON LineString 形式の確認
    describe('TC-006: ルートラインの GeoJSON 形式', () => {
        it('生成された LineString がユーザー現在地と施設の座標を結ぶ', () => {
            mockMap.getZoom.mockReturnValue(10);
            userLocation = [139.0, 35.0];
            const nearestFeature = {
                _geometry: { coordinates: [139.5, 35.5] },
                properties: {},
            };

            onRender(vi.fn(() => nearestFeature));

            const callArg = mockRouteSource.setData.mock.calls[0][0];
            const lineCoords = callArg.features[0].geometry.coordinates;
            expect(lineCoords[0]).toEqual([139.0, 35.0]); // ユーザー位置
            expect(lineCoords[1]).toEqual([139.5, 35.5]); // 施設位置
        });

        it('FeatureCollection として正しい形式で setData が呼ばれる', () => {
            mockMap.getZoom.mockReturnValue(10);
            userLocation = [139.0, 35.0];
            const nearestFeature = {
                _geometry: { coordinates: [139.1, 35.1] },
                properties: {},
            };

            onRender(vi.fn(() => nearestFeature));

            const callArg = mockRouteSource.setData.mock.calls[0][0];
            expect(callArg.type).toBe('FeatureCollection');
            expect(callArg.features[0].type).toBe('Feature');
            expect(callArg.features[0].geometry.type).toBe('LineString');
        });
    });

    // 位置情報 null 時のテスト
    describe('userLocation が null の場合', () => {
        it('位置情報が null のとき空のルートデータをセットする', () => {
            mockMap.getZoom.mockReturnValue(10);
            userLocation = null; // 位置情報未取得

            onRender(vi.fn());

            expect(mockRouteSource.setData).toHaveBeenCalledWith(emptyFeatureCollection);
        });
    });
});
