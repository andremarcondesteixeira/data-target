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
                <section class="content" id="not-the-target">
                    <!-- CONTENT SHOULD NOT BE RENDERED HERE -->
                </section>
            </main>`;

        enableAnchorsTargetSelectors(rootElement);

        return new Promise(resolve => {
            rootElement.addEventListener('hats:DOMContentLoaded', function onContentLoaded(event) {
                const renderedElement = rootElement.querySelector('#target').querySelector('.test-content');
                expect(renderedElement).to.not.be.null;
                rootElement.removeEventListener('hats:DOMContentLoaded', onContentLoaded);
                resolve();
            });

            rootElement.querySelector('a').click();
        });
    });
});
