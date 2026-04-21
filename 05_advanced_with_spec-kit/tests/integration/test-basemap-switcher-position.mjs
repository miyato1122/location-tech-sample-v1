import { readFileSync } from 'node:fs';
import { assert } from '../test-utils.mjs';

const html = readFileSync('index.html', 'utf8');
assert(html.includes('id="basemap-switcher"'), '左下スイッチャーマウント要素が必要');

console.log('PASS: test-basemap-switcher-position');
