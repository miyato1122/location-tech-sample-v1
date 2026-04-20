/**
 * 防災マップ E2Eテスト（逆生成）
 * テストフレームワーク: Playwright
 *
 * 実行方法:
 *   npm install -D @playwright/test
 *   npx playwright install
 *   npx playwright test tests/e2e-map-flow.spec.js
 *
 * 前提条件:
 *   npm run dev でアプリを起動済み（または npm run preview）
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// TC-021: 地図初期表示フロー
test.describe('TC-021: 地図初期表示', () => {
    test('アプリ起動時に日本全体を表示する地図が表示される', async ({ page }) => {
        await page.goto(BASE_URL);

        // MapLibre GL JS のキャンバスが描画されていることを確認
        const canvas = page.locator('canvas.maplibregl-canvas');
        await expect(canvas).toBeVisible({ timeout: 10000 });
    });

    test('ハザードマップコントロール（左上）が表示される', async ({ page }) => {
        await page.goto(BASE_URL);

        // OpacityControl が左上に配置されている
        const control = page.locator('.maplibregl-ctrl-top-left');
        await expect(control).toBeVisible();
    });

    test('避難場所コントロール（右上）が表示される', async ({ page }) => {
        await page.goto(BASE_URL);

        const control = page.locator('.maplibregl-ctrl-top-right');
        await expect(control).toBeVisible();
    });

    test('位置情報ボタン（右下）が表示される', async ({ page }) => {
        await page.goto(BASE_URL);

        const geolocateBtn = page.locator('.maplibregl-ctrl-geolocate');
        await expect(geolocateBtn).toBeVisible();
    });
});

// TC-022: ハザードマップ表示切り替えフロー
test.describe('TC-022: ハザードマップ表示切り替え', () => {
    test('洪水浸水想定区域レイヤーを表示できる', async ({ page }) => {
        await page.goto(BASE_URL);

        // 洪水ラベルのチェックボックス/ラジオボタンをクリック
        await page.click('text=洪水浸水想定区域');

        // レイヤーが visible になっていることを JS 評価で確認
        const visibility = await page.evaluate(() => {
            return window.map?.getLayoutProperty('hazard_flood-layer', 'visibility');
        });
        expect(visibility).toBe('visible');
    });

    test('ハザードマップ表示後に非表示にできる', async ({ page }) => {
        await page.goto(BASE_URL);

        await page.click('text=洪水浸水想定区域');
        await page.click('text=洪水浸水想定区域'); // 再クリックで非表示

        const visibility = await page.evaluate(() => {
            return window.map?.getLayoutProperty('hazard_flood-layer', 'visibility');
        });
        expect(visibility).toBe('none');
    });
});

// TC-023: 避難場所種別切り替えフロー
test.describe('TC-023: 避難場所種別切り替え', () => {
    test('地震対応避難場所レイヤーを表示できる', async ({ page }) => {
        await page.goto(BASE_URL);

        await page.click('text=地震');

        const visibility = await page.evaluate(() => {
            return window.map?.getLayoutProperty('skhb-4-layer', 'visibility');
        });
        expect(visibility).toBe('visible');
    });

    test('別の種別に切り替えると前のレイヤーが非表示になる（排他制御）', async ({ page }) => {
        await page.goto(BASE_URL);

        await page.click('text=地震');
        await page.click('text=津波'); // 別の種別に切り替え

        const earthquakeVisibility = await page.evaluate(() => {
            return window.map?.getLayoutProperty('skhb-4-layer', 'visibility');
        });
        const tsunamiVisibility = await page.evaluate(() => {
            return window.map?.getLayoutProperty('skhb-5-layer', 'visibility');
        });

        expect(earthquakeVisibility).toBe('none');   // 地震: 非表示
        expect(tsunamiVisibility).toBe('visible'); // 津波: 表示
    });
});

// TC-026: ズームレベル変化によるルート表示/非表示
test.describe('TC-026: ズームレベルとルート表示', () => {
    test('ズームレベル7以上のとき最寄り施設へのルートが表示される', async ({ page, context }) => {
        // 位置情報をモック（東京駅付近）
        await context.setGeolocation({ latitude: 35.6812, longitude: 139.7671 });
        await context.grantPermissions(['geolocation']);

        await page.goto(BASE_URL);

        // 避難場所レイヤーを表示
        await page.click('text=地震');

        // 位置情報ボタンをクリック
        await page.click('.maplibregl-ctrl-geolocate');

        // ズームを10に設定
        await page.evaluate(() => window.map?.setZoom(10));
        await page.waitForTimeout(500);

        const routeFeatures = await page.evaluate(() => {
            const data = window.map?.getSource('route')?.serialize?.();
            return data?.data?.features?.length ?? 0;
        });

        expect(routeFeatures).toBe(1);
    });

    test('ズームレベル6のとき（< 7）ルートが非表示になる', async ({ page, context }) => {
        await context.setGeolocation({ latitude: 35.6812, longitude: 139.7671 });
        await context.grantPermissions(['geolocation']);

        await page.goto(BASE_URL);
        await page.click('text=地震');
        await page.click('.maplibregl-ctrl-geolocate');

        // ズームを6に設定（閾値未満）
        await page.evaluate(() => window.map?.setZoom(6));
        await page.waitForTimeout(500);

        const routeFeatures = await page.evaluate(() => {
            const data = window.map?.getSource('route')?.serialize?.();
            return data?.data?.features?.length ?? 0;
        });

        expect(routeFeatures).toBe(0);
    });
});

// TC-027: 3D地形ON/OFFフロー
test.describe('TC-027: 3D地形表示', () => {
    test('TerrainControl が表示されている', async ({ page }) => {
        await page.goto(BASE_URL);

        const terrainControl = page.locator('.maplibregl-ctrl-terrain');
        await expect(terrainControl).toBeVisible({ timeout: 10000 });
    });
});

// TC-028: PWAマニフェスト
test.describe('TC-028: PWAマニフェスト', () => {
    test('manifest.json が正しいアプリ名を持つ', async ({ page }) => {
        const response = await page.request.get(`${BASE_URL}/manifest.json`);
        const manifest = await response.json();

        expect(manifest.name).toBe('防災マップ');
        expect(manifest.short_name).toBe('防災マップ');
        expect(manifest.display).toBe('standalone');
    });

    test('manifest.json に必要なアイコンサイズが含まれる', async ({ page }) => {
        const response = await page.request.get(`${BASE_URL}/manifest.json`);
        const manifest = await response.json();

        const iconSizes = manifest.icons.map((icon) => icon.sizes);
        expect(iconSizes).toContain('192x192');
        expect(iconSizes).toContain('512x512');
    });
});
