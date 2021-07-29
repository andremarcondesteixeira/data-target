import * as lib from '../../src/lib.js';

describe('happy path', () => {
    it('should load content into an specified element by its id using the data-target-id property of an <a> element', () => new Promise(resolve => {
        document.body.insertAdjacentHTML('beforeend', `
            <div>
                <div id="happy-path-content-1"></div>
                <a href="/base/test/happy-path/test1.html" data-target-id="happy-path-content-1" data-init>Test 1</a>
            </div>`);

        document.body.addEventListener('content-loaded', event => event.detail.matchUrl(/^.+\/happy-path\/test1\.html$/, () => {
            expect(event.target).to.be.equal(rootElement.querySelector('#content'));
            expect(event.detail.url).to.be.equal('http://localhost:9876/base/test/happy-path/test1.html');
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(rootElement.querySelector('#content').innerText.trim()).to.be.equal('Test 1');
            resolve();
        }));
    }));
});
