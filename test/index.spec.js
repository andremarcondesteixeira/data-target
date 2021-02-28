import { getAugmentedAnchors } from '../src/index.js';

describe('foo', () => {
    it('select all anchors with data-module attribute', () => {
        const anchors = [
            createAnchor(),
            createAnchorWithDataTarget(),
            createAnchorWithDataTarget(),
            createAnchorWithDataTarget()
        ];
        const container = createDivWith(anchors);
        const selected = getAugmentedAnchors(container);
        assert.equal(selected.length, 3);
    });
});

function createAnchor() {
    const anchor = document.createElement('a');
    anchor.href = '#';
    anchor.target = '_self';
    return anchor;
}

function createAnchorWithDataTarget() {
    const anchor = createAnchor();
    anchor.setAttribute('data-target', '#my-element-id');
    return anchor;
}

function createDivWith(anchors) {
    const div = document.createElement('div');
    anchors.forEach(anchor => div.appendChild(anchor));
    return div;
}
