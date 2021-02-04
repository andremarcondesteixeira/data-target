import { getAugmentedAnchors } from '../src/index.js';

describe('foo', () => {
    it('select all anchors with data-augmented attribute', () => {
        const anchors = [true, true, false, true].map(targetIsSelector => createAnchor(targetIsSelector));
        const container = createDivWith(anchors);
        const selected = getAugmentedAnchors(container);
        assert.equal(selected.length, 3);
    });
});

function createAnchor(targetIsSelector) {
    const anchor = document.createElement('a');
    anchor.href = '#';
    anchor.target = '_self';
    targetIsSelector && anchor.setAttribute('data-augmented', null);
    return anchor;
}

function createDivWith(anchors) {
    const div = document.createElement('div');
    anchors.forEach(anchor => div.appendChild(anchor));
    return div;
}
