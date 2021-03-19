import { getAnchors } from '../src/html-anchor-selector-target.js';

describe('function getAnchors', () => {
    it('should select all anchors with a non-empty data-selector-target attribute', () => {
        const html = `
            <a id="anchor1" href="#" data-selector-target="#someId">anchor 1</a>
            <a id="anchor2" href="#" data-selector-target=".someClass">anchor 1</a>
        `;
        const expectedIDs = [
            'anchor1',
            'anchor2'
        ].sort();

        const rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        const selectedAnchors = getAnchors(rootElement);
        const selectedIDs = Array.from(selectedAnchors).map(element => element.id).sort();

        expect(selectedAnchors.length).to.equal(2);
        expect(expectedIDs.toString()).to.equal(selectedIDs.toString());
    });

    it('should ignore all anchors without or with an empty data-selector-target', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a id="no-data-selector-target"      href="#"               ></a>
            <a id="empty-data-selector-target-1" href="#" data-target=""></a>
            <a id="empty-data-selector-target-2" href="#" data-target   ></a>
        `;
        const selectedAnchors = getAnchors(rootElement);
        assert.equal(selectedAnchors.length, 0);
    });
});
