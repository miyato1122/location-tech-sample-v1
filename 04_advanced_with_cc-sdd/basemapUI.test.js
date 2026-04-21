/**
 * index.html の UI受け皿構造検証テスト
 * node:test + node:assert のみを使用（ブラウザ環境不要）
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'index.html'), 'utf8');

test('背景地図セレクターのコンテナ要素が存在する', () => {
    assert.ok(
        html.includes('id="basemap-control"') ||
            html.includes("id='basemap-control'"),
        'basemap-control コンテナが index.html に存在すること',
    );
});

test('出典表示エリアが存在する', () => {
    assert.ok(
        html.includes('id="basemap-attribution"') ||
            html.includes("id='basemap-attribution'"),
        'basemap-attribution エリアが index.html に存在すること',
    );
});

test('失敗表示エリアが存在する', () => {
    assert.ok(
        html.includes('id="basemap-error"') ||
            html.includes("id='basemap-error'"),
        'basemap-error エリアが index.html に存在すること',
    );
});
