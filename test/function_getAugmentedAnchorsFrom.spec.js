import { getAugmentedAnchorsFrom } from '../src/index.js';
import { createAugmentedAndNonAugmentedAnchors, createDivWithAnchors } from './helpers.mjs';

describe('function getAugmentedAnchorsFrom', () => {
    it('selects all anchors with data-target and/or data-module attribute', () => {
        const anchors = createAugmentedAndNonAugmentedAnchors();
        const container = createDivWithAnchors(anchors);
        const selected = getAugmentedAnchorsFrom(container);
        assert.equal(selected.length, 3);
    });
});
