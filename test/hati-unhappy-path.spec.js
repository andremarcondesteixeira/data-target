import hati from '../src/hati.js';

describe('the unhappy path of hati', () => {
    it('should treat all HTTP statuses equally by default', () => new Promise(resolve => {
        const root = document.createElement('div');
        root.innerHTML = `
            <a href="/base/test/contents/unhappy-path-inexistent-page.html"
               data-target-id="unhappy-path-test1-content"
               data-init>Inexistent Page</a>
            <div id="unhappy-path-test1-content"></div>
        `;
        hati(root);
        const urlRegex = /^.+\/unhappy-path-inexistent-page\.html$/;
        root.addEventListener('hati:DOMContentLoaded', event => event.detail.matchUrl(urlRegex, () => {
            let url = `http://localhost:9876/base/test/contents/unhappy-path-inexistent-page.html`;
            expect(event.detail.url).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#unhappy-path-test1-content'));
            expect(event.detail.responseStatusCode).to.be.equal(404);
            expect(root.querySelector('#unhappy-path-test1-content').innerText).to.be.equal('NOT FOUND');
            resolve();
        }));
    }));

    it('should use the default error handler, if no error handler is provided, when target element is missing', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <a href="/base/test/contents/unhappy-path/test2.html"
               data-target-id="unhappy-path-test2-missing-target"
               data-init>Test 2</a>
        `;
        let error;
        console.error = sinon.stub().callsFake(e => error = e);
        hati(root);
        expect(console.error.callCount).to.be.equal(1);
        expect(error.message).to.be.equal('No element found with id: "unhappy-path-test2-missing-target"');
        sinon.restore();
    });

    it('should use the the provided error handler when target element is missing', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <a href="/base/test/contents/unhappy-path/test3.html"
               data-target-id="unhappy-path-test3-missing-target"
               data-init>Test 3</a>
        `;
        let error;
        const errorHandler = e => error = e;
        hati(root, { errorHandler });
        expect(console.error.callCount).to.be.equal(1);
        expect(error.message).to.be.equal('No element found with id: "unhappy-path-test2-missing-target"');
        sinon.restore();
    });
});
