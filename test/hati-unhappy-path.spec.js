import hati from '../src/hati.js';

describe('the unhappy path of hati', () => {
    it('should treat all HTTP statuses equally by default', () => new Promise(resolveTest1 => {
        const test1Root = document.createElement('div');
        test1Root.innerHTML = `
            <a href="/base/test/contents/unhappy-path-inexistent-page.html"
               data-target-id="unhappy-path-test1-content"
               data-init>Inexistent Page</a>
            <div id="unhappy-path-test1-content"></div>
        `;
        hati(test1Root);
        const test1Url = /^.+\/unhappy-path-inexistent-page\.html$/;
        test1Root.addEventListener('hati:DOMContentLoaded', test1Event => test1Event.detail.matchUrl(test1Url, () => {
            let expectedTest1Url = `http://localhost:9876/base/test/contents/unhappy-path-inexistent-page.html`;
            expect(test1Event.detail.url).to.be.equal(expectedTest1Url);
            expect(test1Event.target).to.be.equal(test1Root.querySelector('#unhappy-path-test1-content'));
            expect(test1Event.detail.responseStatusCode).to.be.equal(404);
            expect(test1Root.querySelector('#unhappy-path-test1-content').innerText).to.be.equal('NOT FOUND');
            resolveTest1();
        }));
    }));
});
