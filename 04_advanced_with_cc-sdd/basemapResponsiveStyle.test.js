import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./style.css', import.meta.url), 'utf8');

test('狭画面向け media query が存在する', () => {
    assert.match(css, /@media\s*\(max-width:\s*480px\)/);
});

test('狭画面時にセレクター幅が制約される', () => {
    assert.match(css, /@media[\s\S]*?\.basemap-control\s*\{[\s\S]*?max-width:\s*110px;/);
});

test('狭画面時にセレクター高さを制限しスクロール可能にする', () => {
    assert.match(css, /@media[\s\S]*?\.basemap-control\s*\{[\s\S]*?max-height:\s*40vh;/);
    assert.match(css, /@media[\s\S]*?\.basemap-control\s*\{[\s\S]*?overflow-y:\s*auto;/);
});
