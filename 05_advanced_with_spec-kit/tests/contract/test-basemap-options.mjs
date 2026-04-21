import { BASEMAP_TYPE_LIST } from '../../src/basemap/basemap-types.js';
import { assert } from '../test-utils.mjs';

assert(BASEMAP_TYPE_LIST.length === 3, '背景地図の選択肢は3種類であること');
assert(BASEMAP_TYPE_LIST.includes('osm'), 'osm が含まれること');
assert(BASEMAP_TYPE_LIST.includes('gsi_std'), 'gsi_std が含まれること');
assert(BASEMAP_TYPE_LIST.includes('gsi_ortho'), 'gsi_ortho が含まれること');

console.log('PASS: test-basemap-options');
