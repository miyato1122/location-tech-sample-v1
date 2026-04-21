import { BASEMAP_ATTRIBUTIONS } from '../../src/basemap/attribution-rules.js';
import { assert } from '../test-utils.mjs';

assert(BASEMAP_ATTRIBUTIONS.gsi_std.includes('国土地理院'), '地理院地図の出典文言が日本語であること');
assert(BASEMAP_ATTRIBUTIONS.gsi_ortho.includes('国土地理院'), '航空写真の出典文言が日本語であること');

console.log('PASS: test-attribution-japanese-text');
