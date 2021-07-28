import initialize, { config } from '../../src/lib.js';

describe('the unhappy path of hati', () => {
    xit('should treat all HTTP statuses equally by default', async () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/unhappy-path-inexistent-page.html"
               data-target-id="unhappy-path-test1-content"
               data-init>Inexistent Page</a>
            <div id="unhappy-path-test1-content"></div>`;

        config.rootElement = rootElement;
        initialize();

        rootElement.addEventListener('content-loaded', event => event.detail.matchUrl(/^.+\/unhappy-path-inexistent-page\.html$/, () => {
            expect(event.detail.url).to.be.equal(`http://localhost:9876/base/test/contents/unhappy-path-inexistent-page.html`);
            expect(event.target).to.be.equal(rootElement.querySelector('#unhappy-path-test1-content'));
            expect(event.detail.responseStatusCode).to.be.equal(404);
            expect(rootElement.querySelector('#unhappy-path-test1-content').innerText).to.be.equal('NOT FOUND');
            done();
        }));
    });

    xit('should use the default error handler, if no error handler is provided, when target element is missing', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/unhappy-path/test2.html"
               data-target-id="unhappy-path-test2-missing-target"
               data-init>Test 2</a>`;
        let error;
        sinon.spy(console.error);

        config.rootElement = rootElement;
        initialize({ rootElement });

        expect(console.error.callCount).to.be.equal(1);
        expect(error.message).to.be.equal('No element found with id: "unhappy-path-test2-missing-target"');
        sinon.restore();
    });

    xit('should use the the provided error handler when target element is missing', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/unhappy-path/test3.html"
               data-target-id="unhappy-path-test3-missing-target"
               data-init>Test 3</a>`;
        let errorMessage;
        const errorHandler = e => errorMessage = e.message;

        initialize({ rootElement, errorHandler });

        expect(errorMessage).to.be.equal('No element found with id: "unhappy-path-test3-missing-target"');
    });
});
