import { enableAnchorsTargetSelectors } from '../src/hats.js';

describe('function enableAnchorsTargetSelectors', () => {
    it('should render content inside the first element found by a valid data-target-selector attribute and dispatches a hats:DOMContentLoaded event', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html" data-target-selector="#main .content">anchor</a>
            <main id="main">
                <!-- CONTENT SHOULD BE RENDERED INSIDE THE ELEMENT BELOW -->
                <section class="content" id="target"></section>
                <!-- CONTENT SHOULD NOT BE RENDERED IN THE ELEMENT BELOW -->
                <section class="content" id="not-the-target">this content must not change</section>
            </main>`;

        enableAnchorsTargetSelectors(rootElement);

        return new Promise(resolve => {
            rootElement.addEventListener('hats:DOMContentLoaded', event => {
                const renderedElement = rootElement.querySelector('#target').querySelector('.test-content');
                expect(renderedElement).to.not.be.null;

                const notTheTarget = rootElement.querySelector('#not-the-target');
                expect(notTheTarget.textContent).to.be.equal('this content must not change');

                expect(event.detail.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');

                resolve();
            });

            rootElement.querySelector('a').click();
        });
    });

    it('should enable data-target-selector in nested anchors', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/nested.html" data-target-selector="#content">anchor</a>
            <section id="content"></section>`;

        enableAnchorsTargetSelectors(rootElement);

        return new Promise(resolve => {
            rootElement.addEventListener('hats:DOMContentLoaded', () => {
                const renderedElement = rootElement.querySelector('#inner-content');
                renderedElement.addEventListener('hats:DOMContentLoaded', () => {
                    const content = renderedElement.querySelector('.test-content');
                    expect(content).to.not.be.null;
                    resolve();
                });

                rootElement.querySelector('#content a').click();
            });

            rootElement.querySelector('a').click();
        });
    });
});
