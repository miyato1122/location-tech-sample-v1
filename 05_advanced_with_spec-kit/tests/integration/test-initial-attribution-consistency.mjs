import { createDisplayState, ensureConsistentState } from '../../src/basemap/display-state.js';
import { assert } from '../test-utils.mjs';

const state = createDisplayState('osm');
assert(ensureConsistentState(state), '初期表示で背景地図と出典が一致すること');

console.log('PASS: test-initial-attribution-consistency');
