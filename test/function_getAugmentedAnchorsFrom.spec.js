import { getAugmentedAnchorsFrom } from '../src/index.js';
import { createAnchors, createDivWith } from './helpers.mjs';

describe('function getAugmentedAnchorsFrom', () => {
    it('selects all anchors with data-target and/or data-module attribute', () => {
        const anchors = createAnchors();
        const container = createDivWith(anchors);
        const selected = getAugmentedAnchorsFrom(container);
        assert.equal(selected.length, 3);
    });
});
