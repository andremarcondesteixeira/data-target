import hati from '../src/hati.js';

describe('hati', () => {
    it('should replace content inside the element which the id is the same as the data-target-id attribute and dispatch a hati:DOMContentLoaded event', () => {
        const html = `
            <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
            <!-- CONTENT SHOULD BE RENDERED INSIDE THE ELEMENT BELOW -->
            <section id="content">
                <p>This content will be replaced</p>
            </section>`;

        return doTest(html, (finish, root, event) => {
            expect(root.querySelector('#test-content').innerText).to.be.equal('Test content');
            expect(event.detail.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
            expect(event.detail.responseStatusCode).to.be.equal(200);
            finish();
        });
    });

    it('should enable data-target-id in nested anchors', () => {
        const html = `
            <a href="/base/test/contents/nested.html" data-target-id="content">anchor</a>
            <section id="content"></section>`;

        return doTest(html, (finish, root) => {
            root.querySelector('#outer-content').addEventListener('hati:DOMContentLoaded', () => {
                expect(root.querySelector('#test-content').innerText).to.be.equal('Test content');
                finish();
            });

            root.querySelector('#content a').click();
        });
    });

    it('should return 404 as responseStatusCode for inexisting pages', () => {
        const html = `
            <a href="/base/test/contents/inexisting.html" data-target-id="content">anchor</a>
            <section id="content"></section>`;

        return doTest(html, (finish, root) => {
            root.querySelector('#content').addEventListener('hati:DOMContentLoaded', event => {
                expect(event.detail.responseStatusCode).to.be.equal(404);
                finish();
            });

            root.querySelector('a').click();
        });
    });

    it('should dispatch a hati:beforeLoad event before trying to load content', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
            <div id="content"></div>`;

        hati({ root });

        return new Promise(resolve => {
            root.addEventListener('hati:beforeLoad', event => {
                expect(event.target).to.be.equal(root.querySelector('a'));
                expect(event.detail.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
                resolve();
            });

            root.querySelector('a').click();
        });
    });

    it('should log an error in the console and dispatch a hati:error event if data-target-id resolves to no element', () => {
        const root = document.createElement('div');
        root.innerHTML = `<a href="/base/test/contents/test-content.html" data-target-id="non-existing-element">anchor</a>`;

        console.error = sinon.fake();

        hati({ root });

        return new Promise(resolve => {
            root.addEventListener('hati:error', event => {
                expect(event.detail.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
                expect(event.detail.errorMessage).to.be.equal('No element found with id: non-existing-element');
                expect(event.target).to.be.equal(root.querySelector('a'));
                resolve();
            });

            root.querySelector('a').click();
            expect(console.error.callCount).to.be.equal(1);
            expect(console.error.firstArg).to.be.equal('No element found with id: non-existing-element');
        });
    });

    it('should change the url without a page reload when an anchor is clicked', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
            <div id="content"></div>`;

        hati({ root });

        root.querySelector('a').click();

        expect(location.href).to.be.equal('http://localhost:9876/base/test/contents/test-content.html');
    });

    it('should call a provided callback to build the actual url that will load documents based on the anchors href', () => {
        setTimeout(() => {
            const html = `
                <a href="/base/test/contents/test-content" data-target-id="content">anchor</a>
                <div id="content"></div>`;
            const router = sinon.spy(href => `${href}.html`);

            return doTest(html, (finish, root) => {
                expect(root.querySelector('#test-content').innerText).to.be.equal('Test content');
                expect(location.href).to.be.equal('http://localhost:9876/base/test/contents/test-content');
                expect(router.callCount).to.be.equal(1);
                finish();
            }, null, { router });
        }, 100);
    });
});

function doTest(html, testFunction, errorHandler, config) {
    const root = document.createElement('div');
    root.innerHTML = html;

    hati({ root, ...config });

    return new Promise(resolve => {
        root.addEventListener('hati:DOMContentLoaded', event => {
            const finish = () => resolve();
            testFunction(finish, root, event);
        });

        try {
            root.querySelector('a').click();
        } catch (error) {
            errorHandler(error);
        }
    });
}
