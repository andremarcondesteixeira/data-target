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
        const url = /^.+\/unhappy-path-inexistent-page\.html$/;
        root.addEventListener('hati:DOMContentLoaded', event => event.detail.matchUrl(url, () => {
            let url = `http://localhost:9876/base/test/contents/unhappy-path-inexistent-page.html`;
            expect(event.detail.url).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#unhappy-path-test1-content'));
            expect(event.detail.responseStatusCode).to.be.equal(404);
            expect(root.querySelector('#unhappy-path-test1-content').innerText).to.be.equal('NOT FOUND');
            resolve();
        }));
    }));
});
