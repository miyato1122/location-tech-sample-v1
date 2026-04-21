import { nextDisplayState, createDisplayState } from '../../src/basemap/display-state.js';
import { assert } from '../test-utils.mjs';

const state = createDisplayState('gsi_std');
const same = nextDisplayState(state, 'gsi_std');
assert(same.changed === false, '同一背景再選択で無駄更新しないこと');

console.log('PASS: test-basemap-regression');
