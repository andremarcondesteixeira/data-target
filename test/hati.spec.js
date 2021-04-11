import hati from '../src/hati.js';

describe('hati', () => {
    it('should work', () => {
        return new Promise(resolve => {
            const root = createRoot();
            prepareTest(root, resolve);
            hati(root, {
                router: href => `${href}.html`
            });
        });
    });
});

function createRoot() {
    const root = document.createElement('div');
    root.innerHTML = `
        <a href="/base/test/contents/page1" id="anchor1" data-target-id="content" data-init>Page 1</a>
        <a href="/base/test/contents/page3" id="anchor2" data-target-id="inexistent-section">Page 2 to inexistent section</a>
        <a href="/base/test/contents/inexistent" id="error404Anchor" data-target-id="content">Page 2</a>
        <nav data-anchors-target-id="content">
            <a href="/base/test/contents/page4" id="anchor4">Page 4</a>
            <a href="/base/test/contents/page5" id="anchor5">Page 5</a>
            <a href="/base/test/contents/page6" id="anchor6" data-target-id="content-2">Page 6</a>
        </nav>
        <div id="content"></div>
        <div id="content-2"></div>
    `;
    return root;
}

function prepareTest(root, resolve) {
    root.addEventListener('hati:beforeLoad', event => {
        event.detail.matchUrl(/^.*\/page1$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page1`);
            expect(event.target).to.be.equal(root.querySelector('#anchor1'));
        });

        event.detail.matchUrl(/^.*\/page1\/page1-2$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page1/page1-2`);
            expect(event.target).to.be.equal(root.querySelector('#content a'));
        });

        event.detail.matchUrl(/^.*\/page2$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page2`);
            expect(event.target).to.be.equal(root.querySelector('#page-1-subcontent a'));
        });

        event.detail.matchUrl(/^.*\/page3$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page3`);
            expect(event.target).to.be.equal(root.querySelector('#anchor2'));
        });

        event.detail.matchUrl(/^.*\/inexistent$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/inexistent`);
            expect(event.target).to.be.equal(root.querySelector('#error404Anchor'));
        });

        event.detail.matchUrl(/^.*\/page4$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page4`);
            expect(event.target).to.be.equal(root.querySelector('#anchor4'));
        });

        event.detail.matchUrl(/^.*\/page5$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page5`);
            expect(event.target).to.be.equal(root.querySelector('#anchor5'));
        });

        event.detail.matchUrl(/^.*\/page6$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page6`);
            expect(event.target).to.be.equal(root.querySelector('#anchor6'));
        });
    });

    root.addEventListener('hati:DOMContentLoaded', event => {
        event.detail.matchUrl(/^.*\/page1$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page1`);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content .content').innerText).to.be.equal('page 1');
            root.querySelector('#content a').click();
        });

        event.detail.matchUrl(/^.*\/page1\/page1-2$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page1/page1-2`);
            expect(event.target).to.be.equal(root.querySelector('#page-1-subcontent'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#page-1-subcontent .content').innerText).to.be.equal('page 1-2');
            root.querySelector('#page-1-subcontent a').click();
        });

        event.detail.matchUrl(/^.*\/page2$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page2`);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content .content').innerText).to.be.equal('page 2');
            root.querySelector('#anchor2').click();
        });

        event.detail.matchUrl(/^.*\/inexistent$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/inexistent`);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(404);
            expect(root.querySelector('#content').innerText).to.be.equal('NOT FOUND');
            root.querySelector('#anchor4').click();
        });

        event.detail.matchUrl(/^.*\/page4$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page4`);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content .content').innerText).to.be.equal('page 4');
            root.querySelector('#anchor5').click();
        });

        event.detail.matchUrl(/^.*\/page5$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page5`);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content .content').innerText).to.be.equal('page 5');
            root.querySelector('#anchor6').click();
        });

        event.detail.matchUrl(/^.*\/page6$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page6`);
            expect(event.target).to.be.equal(root.querySelector('#content-2'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content-2 .content').innerText).to.be.equal('page 6');
            resolve();
        });
    });

    root.addEventListener('hati:error', event => {
        event.detail.matchUrl(/^.*\/page3$/, () => {
            expect(event.detail.href).to.be.equal(`http://localhost:9876/base/test/contents/page3`);
            expect(event.target).to.be.equal(root.querySelector('#anchor2'));
            expect(event.detail.errorMessage).to.be.equal('No element found with id: inexistent-section');
            root.querySelector('#error404Anchor').click();
        });
    });
}
