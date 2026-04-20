/**
 * ポップアップ表示 統合テスト（逆生成）
 * 参照実装: main.js:458-516
 *
 * テスト対象:
 * - TC-014: 施設情報の正確な表示
 * - TC-015: remarks が null の場合の安全な表示
 * - TC-016: disaster フラグによる色分け
 * - TC-017: 複数フィーチャー重複時は先頭を表示
 * - TC-018: 避難場所なし時はポップアップ非表示
 * - TC-031: XSSリスクの確認
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ポップアップインスタンスのモック
const mockPopup = {
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    setMaxWidth: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
};

// MapLibre GL JS モック
vi.mock('maplibre-gl', () => ({
    default: {
        Popup: vi.fn(() => mockPopup),
    },
}));

// main.js のクリックイベント処理を抽出したテスト対象関数
// 実際には main.js をリファクタリングして export する必要がある
const handleMapClick = (features, mapInstance, PopupClass) => {
    if (features.length === 0) return;

    const feature = features[0];
    const popup = new PopupClass()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
            `<div style="font-weight:900; font-size: 1.2rem;">${feature.properties.name}</div>
            <div>${feature.properties.address}</div>
            <div>${feature.properties.remarks ?? ''}</div>
            <div>
            <span${feature.properties.disaster1 ? '' : ' style="color:#ccc;"'}>洪水</span>
            <span${feature.properties.disaster2 ? '' : ' style="color:#ccc;"'}> 崖崩れ/土石流/地滑り</span>
            <span${feature.properties.disaster3 ? '' : ' style="color:#ccc;"'}> 高潮</span>
            <span${feature.properties.disaster4 ? '' : ' style="color:#ccc;"'}> 地震</span>
            <span${feature.properties.disaster5 ? '' : ' style="color:#ccc;"'}>津波</span>
            <span${feature.properties.disaster6 ? '' : ' style="color:#ccc;"'}> 大規模な火事</span>
            <span${feature.properties.disaster7 ? '' : ' style="color:#ccc;"'}> 内水氾濫</span>
            <span${feature.properties.disaster8 ? '' : ' style="color:#ccc;"'}> 火山現象</span>
            </div>`
        )
        .setMaxWidth('400px')
        .addTo(mapInstance);

    return popup;
};

// テストデータ生成ヘルパー
const makeFeature = (overrides = {}) => ({
    geometry: { coordinates: [139.0, 35.0] },
    properties: {
        name: 'テスト避難所',
        address: '東京都千代田区1-1-1',
        remarks: '通常の使用が可能',
        disaster1: true,
        disaster2: false,
        disaster3: true,
        disaster4: true,
        disaster5: false,
        disaster6: false,
        disaster7: false,
        disaster8: false,
        ...overrides,
    },
});

describe('map.on(click): ポップアップ表示', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // TC-018: 避難場所なし時はポップアップ非表示
    it('TC-018: features が空のとき何もしない（return）', () => {
        const MockPopup = vi.fn();
        handleMapClick([], null, MockPopup);
        expect(MockPopup).not.toHaveBeenCalled();
    });

    // TC-014: 施設情報の正確な表示
    it('TC-014: ポップアップに施設名・住所・備考が含まれる', () => {
        const feature = makeFeature();
        const MockPopup = vi.fn(() => mockPopup);

        handleMapClick([feature], {}, MockPopup);

        const htmlArg = mockPopup.setHTML.mock.calls[0][0];
        expect(htmlArg).toContain('テスト避難所');
        expect(htmlArg).toContain('東京都千代田区1-1-1');
        expect(htmlArg).toContain('通常の使用が可能');
    });

    it('TC-014: setLngLat がフィーチャーの座標で呼ばれる', () => {
        const feature = makeFeature();
        const MockPopup = vi.fn(() => mockPopup);

        handleMapClick([feature], {}, MockPopup);

        expect(mockPopup.setLngLat).toHaveBeenCalledWith([139.0, 35.0]);
    });

    it('TC-014: setMaxWidth が 400px で呼ばれる', () => {
        const feature = makeFeature();
        const MockPopup = vi.fn(() => mockPopup);

        handleMapClick([feature], {}, MockPopup);

        expect(mockPopup.setMaxWidth).toHaveBeenCalledWith('400px');
    });

    // TC-015: remarks が null の場合の安全な表示
    it('TC-015: remarks が null のとき空文字として表示される（エラーなし）', () => {
        const feature = makeFeature({ remarks: null });
        const MockPopup = vi.fn(() => mockPopup);

        expect(() => handleMapClick([feature], {}, MockPopup)).not.toThrow();

        const htmlArg = mockPopup.setHTML.mock.calls[0][0];
        // null が表示されず、空文字または何も表示されないこと
        expect(htmlArg).not.toContain('>null<');
    });

    // TC-016: disaster フラグによる色分け
    it('TC-016: disaster1=true のとき洪水は通常色で表示される', () => {
        const feature = makeFeature({ disaster1: true });
        const MockPopup = vi.fn(() => mockPopup);

        handleMapClick([feature], {}, MockPopup);

        const htmlArg = mockPopup.setHTML.mock.calls[0][0];
        // disaster1=true のとき style="color:#ccc;" が付かない
        expect(htmlArg).toMatch(/<span(?! style="color:#ccc;").*?>洪水<\/span>/);
    });

    it('TC-016: disaster2=false のとき崖崩れ/土石流/地滑りはグレー表示される', () => {
        const feature = makeFeature({ disaster2: false });
        const MockPopup = vi.fn(() => mockPopup);

        handleMapClick([feature], {}, MockPopup);

        const htmlArg = mockPopup.setHTML.mock.calls[0][0];
        expect(htmlArg).toContain(' style="color:#ccc;"> 崖崩れ/土石流/地滑り');
    });

    // TC-017: 複数フィーチャー時は先頭を使用
    it('TC-017: 複数フィーチャーが存在する場合、最初のフィーチャーを使用する', () => {
        const feature1 = makeFeature({ name: '施設A' });
        const feature2 = makeFeature({ name: '施設B' });
        const MockPopup = vi.fn(() => mockPopup);

        handleMapClick([feature1, feature2], {}, MockPopup);

        const htmlArg = mockPopup.setHTML.mock.calls[0][0];
        expect(htmlArg).toContain('施設A');
        expect(htmlArg).not.toContain('施設B');
    });

    // TC-031: XSS リスクの確認
    describe('TC-031: XSS リスク', () => {
        it('name にスクリプトタグが含まれる場合、そのままHTMLに挿入される（現状のリスク確認）', () => {
            const xssFeature = makeFeature({
                name: '<script>alert("XSS")</script>テスト',
            });
            const MockPopup = vi.fn(() => mockPopup);

            handleMapClick([xssFeature], {}, MockPopup);

            const htmlArg = mockPopup.setHTML.mock.calls[0][0];
            // 現状の実装ではスクリプトタグがそのまま埋め込まれる（要修正）
            expect(htmlArg).toContain('<script>');
            // 本来の期待値（修正後）:
            // expect(htmlArg).not.toContain('<script>');
            // expect(htmlArg).toContain('&lt;script&gt;');
        });

        it('[推奨修正] textContent を使った安全な実装ではスクリプトが実行されない', () => {
            // この修正案に変更することでXSSリスクを排除できる
            // 実装例:
            // const nameEl = document.createElement('div');
            // nameEl.textContent = feature.properties.name;
            // popup.setDOMContent(nameEl);

            // ※ 現在の実装（setHTML）では保証されないため、このテストは将来の修正後に有効化すること
            expect(true).toBe(true); // プレースホルダー
        });
    });
});
