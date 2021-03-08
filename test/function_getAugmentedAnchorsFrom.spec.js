import { getAugmentedAnchorsFrom } from '../src/augmented-anchors.js';

describe('function getAugmentedAnchorsFrom', () => {
    it('should select all anchors with valid data-target and data-module attributes combinations', () => {
        const html = `
            <a id="OK-with-data-target-without-data-module"      href="#" data-target="whatever"                       ></a>
            <a id="OK-with-data-target-with-empty-data-module-A" href="#" data-target="whatever" data-module=""        ></a>
            <a id="OK-with-data-target-with-empty-data-module-B" href="#" data-target="whatever" data-module           ></a>
            <a id="OK-with-data-target-with-data-module"         href="#" data-target="whatever" data-module="whatever"></a>
        `;
        const expectedIDs = [
            'OK-with-data-target-without-data-module',
            'OK-with-data-target-with-empty-data-module-A',
            'OK-with-data-target-with-empty-data-module-B',
            'OK-with-data-target-with-data-module'
        ].sort();

        const rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        const selectedAnchors = getAugmentedAnchorsFrom(rootElement);
        const selectedIDs = Array.from(selectedAnchors).map(element => element.id).sort();

        expect(selectedAnchors.length).to.equal(4);
        expect(expectedIDs.toString()).to.equal(selectedIDs.toString());
    });

    it('should ignore all anchors with invalid data-target and data-module attributes combinations', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a id="IGNORED-non-augmented"                                   href="#"                                      ></a>
            <a id="IGNORED-with-empty-data-target-without-data-module-A"    href="#" data-target=""                       ></a>
            <a id="IGNORED-with-empty-data-target-without-data-module-B"    href="#" data-target                          ></a>
            <a id="IGNORED-without-data-target-with-empty-data-module-A"    href="#"                data-module=""        ></a>
            <a id="IGNORED-without-data-target-with-empty-data-module-B"    href="#"                data-module           ></a>
            <a id="IGNORED-with-empty-data-target-with-empty-data-module-A" href="#" data-target="" data-module=""        ></a>
            <a id="IGNORED-with-empty-data-target-with-empty-data-module-B" href="#" data-target    data-module=""        ></a>
            <a id="IGNORED-with-empty-data-target-with-empty-data-module-C" href="#" data-target="" data-module           ></a>
            <a id="IGNORED-with-empty-data-target-with-empty-data-module-D" href="#" data-target    data-module           ></a>
            <a id="IGNORED-without-data-target-with-data-module"            href="#"                data-module="whatever"></a>
            <a id="IGNORED-with-empty-data-target-with-data-module-A"       href="#" data-target="" data-module="whatever"></a>
            <a id="IGNORED-with-empty-data-target-with-data-module-B"       href="#" data-target    data-module="whatever"></a>
        `;
        const selectedAnchors = getAugmentedAnchorsFrom(rootElement);
        assert.equal(selectedAnchors.length, 0);
    });
});
