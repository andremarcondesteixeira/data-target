import { getAnchors } from '../src/hati.js';

describe('function getAnchors', () => {
    it('should select all anchors with a non-empty data-target-selector attribute', () => {
        const html = `
            <a id="anchor1" href="#" data-target-selector="#someId">anchor 1</a>
            <a id="anchor2" href="#" data-target-selector=".someClass">anchor 1</a>
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

    it('should ignore all anchors without or with an empty data-target-selector', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a id="no-data-target-selector"      href="#"               ></a>
            <a id="empty-data-target-selector-1" href="#" data-target=""></a>
            <a id="empty-data-target-selector-2" href="#" data-target   ></a>
        `;
        const selectedAnchors = getAnchors(rootElement);
        assert.equal(selectedAnchors.length, 0);
    });
});
