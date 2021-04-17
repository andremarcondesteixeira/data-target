import hati from '../src/hati.js';

describe('the happy path of hati', () => {
    it('should treat all HTTP statuses equally by default', () => new Promise(resolve => {
        const root = document.createElement('div');
        root.innerHTML = `
            <a href="/base/test/contents/unhappy-inexistent-page.html" data-target-id="content" data-init>Inexistent Page</a>
            <div id="content"></div>
        `;
        hati(root);
        root.querySelector('#content').addEventListener('hati:DOMContentLoaded', event => {
            event.detail.matchUrl(/^.+\/unhappy-inexistent-page\.html$/, () => {
                let url = `http://localhost:9876/base/test/contents/unhappy-inexistent-page.html`;
                expect(event.detail.url).to.be.equal(url);
                expect(event.target).to.be.equal(root.querySelector('#content'));
                expect(event.detail.responseStatusCode).to.be.equal(404);
                expect(root.querySelector('#content').innerText).to.be.equal('something');
                resolve();
            });
        });
    }));
});
