import { getAnchors } from '../src/hati.js';

describe('function getAnchors', () => {
    it('should select all anchors with a non-empty data-target-id attribute', () => {
        const html = `
            <a id="anchor1" href="#" data-target-id="someId">anchor 1</a>
            <a id="anchor2" href="#" data-target-id="someOtherId">anchor 2</a>
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

    it('should ignore all anchors without or with an empty data-target-id', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a id="no-data-target-id"      href="#"               ></a>
            <a id="empty-data-target-id-1" href="#" data-target-id=""></a>
            <a id="empty-data-target-id-2" href="#" data-target-id   ></a>
        `;
        const selectedAnchors = getAnchors(rootElement);
        assert.equal(selectedAnchors.length, 0);
    });
});
