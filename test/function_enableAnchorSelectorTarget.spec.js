import { initialize } from '../src/hats.js';

describe('function enableAnchorsTargetSelectors', () => {
    it('should replace content inside the first element found by a valid data-target-selector attribute and dispatches a hats:DOMContentLoaded event', () => {
        const html = `
            <a href="/base/test/contents/test-content.html" data-target-selector="#main .content">anchor</a>
            <main id="main">
                <!-- CONTENT SHOULD BE RENDERED INSIDE THE ELEMENT BELOW -->
                <section class="content" id="target">
                    <p>This content will be replaced</p>
                </section>
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

    it('should run a callback before trying to load content', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <a href="/base/test/contents/test-content.html" data-target-selector="#content">anchor</a>
            <div id="content"></div>`;
        let callbackCalled = false;
        initialize(root, () => callbackCalled = true);
        root.querySelector('a').click();
        expect(callbackCalled).to.be.true;
    });

    it('should throw an error if data-target-selector resolves to no element', () => {
        console.error = sinon.fake();
        const root = document.createElement('div');
        root.innerHTML = `<a href="/base/test/contents/test-content.html" data-target-selector="#non-existing-element">anchor</a>`;
        initialize(root);
        root.querySelector('a').click();
        expect(console.error.callCount).to.be.equal(1);
        expect(console.error.firstArg).to.be.equal('No element found with selector: #non-existing-element');
    });
});

function doTest(html, testFunction, errorHandler) {
    const rootElement = document.createElement('div');
    rootElement.innerHTML = html;

    initialize(rootElement);

    return new Promise(resolve => {
        rootElement.addEventListener('hats:DOMContentLoaded', event => {
            const finish = () => resolve();
            testFunction(finish, rootElement, event);
        });

        try {
            rootElement.querySelector('a').click();
        } catch (error) {
            errorHandler(error);
        }
    });
}
