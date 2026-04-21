import { createDisplayState, nextDisplayState } from '../../src/basemap/display-state.js';
import { assert } from '../test-utils.mjs';

const state = createDisplayState('osm');
const switched = nextDisplayState(state, 'gsi_std');
assert(switched.changed === true, '背景地図切り替えで changed=true になること');
assert(switched.state.activeBasemap === 'gsi_std', '切り替え先が反映されること');

console.log('PASS: test-basemap-switching');
