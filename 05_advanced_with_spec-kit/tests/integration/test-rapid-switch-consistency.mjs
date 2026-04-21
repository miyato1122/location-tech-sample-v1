import { createDisplayState, nextDisplayState, ensureConsistentState } from '../../src/basemap/display-state.js';
import { assert } from '../test-utils.mjs';

let state = createDisplayState('osm');
state = nextDisplayState(state, 'gsi_std').state;
state = nextDisplayState(state, 'gsi_ortho').state;
state = nextDisplayState(state, 'osm').state;
assert(ensureConsistentState(state), '連続切り替え後の最終状態が整合すること');

console.log('PASS: test-rapid-switch-consistency');
