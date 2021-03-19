import { enableAnchorsTargetSelectors } from '../src/hats.js';

describe('function enableAnchorsTargetSelectors', () => {
    it('should render content inside the first element found by a valid data-target-selector attribute and dispatches a hats:DOMContentLoaded event', () => {
        const html = `
            <a href="/base/test/contents/test-content.html" data-target-selector="#main .content">anchor</a>
            <main id="main">
                <!-- CONTENT SHOULD BE RENDERED INSIDE THE ELEMENT BELOW -->
                <section class="content" id="target"></section>
                <!-- CONTENT SHOULD NOT BE RENDERED IN THE ELEMENT BELOW -->
                <section class="content" id="not-the-target">this content must not change</section>
            </main>`;

        return doTest(html, (finish, root, event) => {
            expect(root.querySelector('#target').querySelector('.test-content')).to.not.be.null;
            expect(root.querySelector('#not-the-target').textContent).to.be.equal('this content must not change');
            expect(event.detail.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
            finish();
        });
    });

    it('should enable data-target-selector in nested anchors', () => {
        const html = `
            <a href="/base/test/contents/nested.html" data-target-selector="#content">anchor</a>
            <section id="content"></section>`;

        return doTest(html, (finish, root) => {
            root.querySelector('#inner-content').addEventListener('hats:DOMContentLoaded', () => {
                expect(root.querySelector('.test-content')).to.not.be.null;
                finish();
            });

            root.querySelector('#content a').click();
        });
    });
});

function doTest(html, testFunction) {
    const rootElement = document.createElement('div');
    rootElement.innerHTML = html;

    enableAnchorsTargetSelectors(rootElement);

    return new Promise(resolve => {
        rootElement.addEventListener('hats:DOMContentLoaded', event => {
            testFunction(() => resolve(), rootElement, event);
        });

        rootElement.querySelector('a').click();
    });
}
