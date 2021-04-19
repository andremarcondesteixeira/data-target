import hati from '../../src/hati.js';

describe('hati unhappy path', () => {
    let root;

    beforeEach(() => {
        root = document.createElement('div');
    });

    it('should load content into an specified element by its id using the data-target-id property of an <a> element', () => new Promise(resolve => {
        root.innerHTML = `
            <a href="/base/test/happy-path/test1.html" data-target-id="content">Test 1</a>
            <div id="content"><div>
        `;

        hati(root);
        root.addEventListener('hati:DOMContentLoaded', event => event.detail.matchUrl(/^.+\/happy-path\/test1\.html$/, () => {
            console.log(event.detail);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.url).to.be.equal('http://localhost:9876/base/test/happy-path/test1.html');
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content').innerText.trim()).to.be.equal('Test 1');
            resolve();
        }));

        root.querySelector('a').click();
    }));
});
