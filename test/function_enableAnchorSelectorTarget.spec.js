import { enableAnchorsTargetSelectors } from '../src/hats.js';

describe('function enableAnchorsTargetSelectors', () => {
    it('should render content inside the first element found by a valid data-target-selector attribute', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html"
               data-target-selector="#main .content">anchor</a>
            <main id="main">
                <section class="content" id="target">
                    <!-- CONTENT SHOULD BE RENDERED HERE -->
                </section>
                <!-- CONTENT SHOULD NOT BE RENDERED IN THE ELEMENT BELOW -->
                <section class="content" id="not-the-target">this content must not change</section>
            </main>`;

        enableAnchorsTargetSelectors(rootElement);

        return new Promise(resolve => {
            rootElement.addEventListener('hats:DOMContentLoaded', function onContentLoaded(event) {
                const renderedElement = rootElement.querySelector('#target').querySelector('.test-content');
                expect(renderedElement).to.not.be.null;

                const notTheTarget = rootElement.querySelector('#not-the-target');
                expect(notTheTarget.textContent).to.be.equal('this content must not change');

                rootElement.removeEventListener('hats:DOMContentLoaded', onContentLoaded);
                resolve();
            });

            rootElement.querySelector('a').click();
        });
    });
});
