import { createDisplayState, nextDisplayState } from '../../src/basemap/display-state.js';
import { getAttributionText } from '../../src/basemap/attribution-rules.js';
import { assert } from '../test-utils.mjs';

const state = createDisplayState('osm');
const switched = nextDisplayState(state, 'gsi_ortho').state;
assert(switched.activeAttribution === getAttributionText('gsi_ortho'), '出典が背景地図に同期すること');

console.log('PASS: test-attribution-sync');
