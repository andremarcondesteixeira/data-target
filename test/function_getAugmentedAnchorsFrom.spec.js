import { getAugmentedAnchorsFrom } from '../src/index.js';

describe('function getAugmentedAnchorsFrom', () => {
    it('selects all anchors with data-target and/or data-module attribute', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="#">Non augmented anchor</a>
            <a href="#" data-target="whatever">Anchor with data-target</a>
            <a href="#" data-module="whatever">Anchor with data-module</a>
            <a href="#" data-target="whatever" data-module="whatever">Anchor with data-target and data-module</a>`;
        const selected = getAugmentedAnchorsFrom(rootElement);
        assert.equal(selected.length, 3);
    });
});
