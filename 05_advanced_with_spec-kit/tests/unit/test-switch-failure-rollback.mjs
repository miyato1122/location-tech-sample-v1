import { applyWithRollback } from '../../src/basemap/state-guard.js';
import { createDisplayState } from '../../src/basemap/display-state.js';
import { assert } from '../test-utils.mjs';

const currentState = createDisplayState('osm');
const result = await applyWithRollback(currentState, async () => {
    throw new Error('network failure');
});

assert(result.ok === false, '失敗時に ok=false を返すこと');
assert(result.state.activeBasemap === currentState.activeBasemap, '失敗時に前状態を維持すること');

console.log('PASS: test-switch-failure-rollback');
