import { initialize } from '../src/hati.js';

describe('function initialize', () => {
    it('should replace content inside the element which the id is the same as the data-target-id attribute and dispatch a hati:DOMContentLoaded event', () => {
        const html = `
            <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
            <!-- CONTENT SHOULD BE RENDERED INSIDE THE ELEMENT BELOW -->
            <section id="content">
                <p>This content will be replaced</p>
            </section>`;

        return doTest(html, (finish, rootElement, event) => {
            expect(rootElement.querySelector('#test-content').innerText).to.be.equal('Test content');
            expect(event.detail.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
            expect(event.detail.responseStatusCode).to.be.equal(200);
            finish();
        });
    });

    it('should enable data-target-id in nested anchors', () => {
        const html = `
            <a href="/base/test/contents/nested.html" data-target-id="content">anchor</a>
            <section id="content"></section>`;

        return doTest(html, (finish, rootElement) => {
            rootElement.querySelector('#outer-content').addEventListener('hati:DOMContentLoaded', () => {
                expect(rootElement.querySelector('#test-content').innerText).to.be.equal('Test content');
                finish();
            });

            rootElement.querySelector('#content a').click();
        });
    });

    it('should return 404 as responseStatusCode for inexisting pages', () => {
        const html = `
            <a href="/base/test/contents/inexisting.html" data-target-id="content">anchor</a>
            <section id="content"></section>`;

        return doTest(html, (finish, rootElement) => {
            rootElement.querySelector('#content').addEventListener('hati:DOMContentLoaded', event => {
                expect(event.detail.responseStatusCode).to.be.equal(404);
                finish();
            });

            rootElement.querySelector('a').click();
        });
    });

    it('should dispatch a hati:beforeLoad event before trying to load content', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
            <div id="content"></div>`;

        initialize(rootElement);

        return new Promise(resolve => {
            rootElement.addEventListener('hati:beforeLoad', event => {
                expect(event.target).to.be.equal(rootElement.querySelector('a'));
                expect(event.detail.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
                resolve();
            });

            rootElement.querySelector('a').click();
        });
    });

    it('should log an error in the console and dispatch a hati:error event if data-target-id resolves to no element', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `<a href="/base/test/contents/test-content.html" data-target-id="non-existing-element">anchor</a>`;

        console.error = sinon.fake();

        initialize(rootElement);

        return new Promise(resolve => {
            rootElement.addEventListener('hati:error', event => {
                expect(event.detail.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
                expect(event.detail.errorMessage).to.be.equal('No element found with id: non-existing-element');
                expect(event.target).to.be.equal(rootElement.querySelector('a'));
                resolve();
            });

            rootElement.querySelector('a').click();
            expect(console.error.callCount).to.be.equal(1);
            expect(console.error.firstArg).to.be.equal('No element found with id: non-existing-element');
        });
    });

    it('should change the url without a page reload when an anchor is clicked', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
            <div id="content"></div>`;

        initialize(rootElement);

        rootElement.querySelector('a').click();

        expect(window.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
    });
});

function doTest(html, testFunction, errorHandler) {
    const rootElement = document.createElement('div');
    rootElement.innerHTML = html;

    initialize(rootElement);

    return new Promise(resolve => {
        rootElement.addEventListener('hati:DOMContentLoaded', event => {
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
