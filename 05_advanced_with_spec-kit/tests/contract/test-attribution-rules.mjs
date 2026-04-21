import { BASEMAP_TYPE_LIST } from '../../src/basemap/basemap-types.js';
import { getAttributionText } from '../../src/basemap/attribution-rules.js';
import { assert } from '../test-utils.mjs';

BASEMAP_TYPE_LIST.forEach((type) => {
    const text = getAttributionText(type);
    assert(typeof text === 'string' && text.length > 0, `${type} の出典が未定義`);
});

console.log('PASS: test-attribution-rules');
