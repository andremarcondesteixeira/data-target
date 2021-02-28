import { getAugmentedAnchorsFrom } from '../src/index.js';

describe('getAugmentedAnchorsFrom', () => {
    it('select all anchors with data-target and/or data-module attribute', () => {
        const anchors = [
            createAnchor(),
            createAnchor({ 'data-target': '#my-element-id' }),
            createAnchor({ 'data-module': 'path/to/my/script.js' }),
            createAnchor({ 'data-target': '#my-element-id', 'data-module': 'path/to/my/script.js' })
        ];
        const container = createDivWith(anchors);
        const selected = getAugmentedAnchorsFrom(container);
        assert.equal(selected.length, 3);
    });
});

function createAnchor(extraAttributes = {}) {
    const anchor = document.createElement('a');
    anchor.href = '#';
    anchor.target = '_self';
    for (let attribute in extraAttributes) {
        anchor.setAttribute(attribute, extraAttributes[attribute]);
    }
    return anchor;
}

function createDivWith(anchors) {
    const div = document.createElement('div');
    anchors.forEach(anchor => div.appendChild(anchor));
    return div;
}
