import { getAugmentedAnchorsFrom } from '../src/index.js';

describe('function getAugmentedAnchorsFrom', () => {
    it('selects all anchors with valid data-target and data-module attributes combinations', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a id="OK-with-data-target-without-data-module"                 href="#" data-target="whatever"                       ></a>
            <a id="OK-with-data-target-with-empty-data-module-A"            href="#" data-target="whatever" data-module=""        ></a>
            <a id="OK-with-data-target-with-empty-data-module-B"            href="#" data-target="whatever" data-module           ></a>
            <a id="OK-without-data-target-with-data-module"                 href="#"                        data-module="whatever"></a>
            <a id="OK-with-empty-data-target-with-data-module-A"            href="#" data-target=""         data-module="whatever"></a>
            <a id="OK-with-empty-data-target-with-data-module-B"            href="#" data-target            data-module="whatever"></a>
            <a id="OK-with-data-target-with-data-module"                    href="#" data-target="whatever" data-module="whatever"></a>
        `;
        const selected = getAugmentedAnchorsFrom(rootElement);
        assert.equal(selected.length, 7);
    });

    it('ignores all anchors with invalid data-target and data-module attributes combinations', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a id="IGNORED-non-augmented"                                   href="#"                                      ></a>
            <a id="IGNORED-with-empty-data-target-without-data-module-A"    href="#" data-target=""                       ></a>
            <a id="IGNORED-with-empty-data-target-without-data-module-B"    href="#" data-target                          ></a>
            <a id="IGNORED-without-data-target-with-empty-data-module-A"    href="#"                        data-module=""></a>
            <a id="IGNORED-without-data-target-with-empty-data-module-B"    href="#"                        data-module   ></a>
            <a id="IGNORED-with-empty-data-target-with-empty-data-module-A" href="#" data-target=""         data-module=""></a>
            <a id="IGNORED-with-empty-data-target-with-empty-data-module-B" href="#" data-target            data-module=""></a>
            <a id="IGNORED-with-empty-data-target-with-empty-data-module-C" href="#" data-target=""         data-module   ></a>
            <a id="IGNORED-with-empty-data-target-with-empty-data-module-D" href="#" data-target            data-module   ></a>
        `;
        const selected = getAugmentedAnchorsFrom(rootElement);
        assert.equal(selected.length, 0);
    });
});
