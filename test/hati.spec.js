import hati from '../src/hati.js';

describe('hati', () => {
    it('should work', () => {
        return new Promise(resolve => {
            testWithoutDataInitOrRouter(() => {
                testWithDataInitWithoutRouter(() => {
                    testWithoutDataInitWithRouter(() => {
                        testWithDataInitAndRouter(resolve);
                    });
                });
            });
        });
    });
});

function testWithoutDataInitOrRouter(finish) {
    const root = createRootWithoutDataInit('.html');
    prepareTest(root, finish, '.html');
    hati(root);
    const anchor = root.querySelector('#anchor1');
    anchor.click();
}

function testWithDataInitWithoutRouter(finish) {
    const root = createRoot('.html');
    prepareTest(root, finish, '.html');
    hati(root);
}

function testWithoutDataInitWithRouter(finish) {
    const root = createRootWithoutDataInit();
    prepareTest(root, finish);
    hati(root, {
        router: href => `${href}.html`
    });
    const anchor = root.querySelector('#anchor1');
    anchor.click();
}

function testWithDataInitAndRouter(finish) {
    const root = createRoot();
    prepareTest(root, finish);
    hati(root, {
        router: href => `${href}.html`
    });
}

function createRoot(urlSuffix = '') {
    const root = document.createElement('div');
    const anchor1Suffix = urlSuffix ? `-with-extensions${urlSuffix}` : '';
    root.innerHTML = `
        <a href="/base/test/contents/page1${anchor1Suffix}"
           id="anchor1"
           data-target-id="content"
           data-init>Page 1</a>

        <nav data-anchors-target-id="content">
            <a href="/base/test/contents/page2${urlSuffix}"
               id="anchor2">Page 2</a>

            <a href="/base/test/contents/page3${urlSuffix}"
               id="anchor3">Page 3</a>

            <a href="/base/test/contents/page4${urlSuffix}"
               id="anchor4"
               data-target-id="content-2">Page 4</a>

            <a href="/base/test/contents/error404${urlSuffix}"
               id="error404anchor">Error 404</a>
        </nav>

        <a href="/base/test/contents/page1${anchor1Suffix}"
           id="targetError"
           data-target-id="inexistent-element">Target Error</a>

        <div id="content"></div>
        <div id="content-2"></div>
    `;
    return root;
}

function createRootWithoutDataInit(urlSuffix = '') {
    const root = createRoot(urlSuffix);
    root.querySelector('#anchor1').removeAttribute('data-init');
    return root;
}

function prepareTest(root, finish, urlSuffix = '') {
    let amountOfTestsRunned = 0;
    let page3Visits = 0;

    root.addEventListener('hati:DOMContentLoaded', event => {
        event.detail.matchUrl(new RegExp(`^.+\/page1${regexSuffix(urlSuffix)}$`), () => step1(event));
        event.detail.matchUrl(new RegExp(`^.+\/page1\/page1-2${regexSuffix(urlSuffix)}$`), () => step2(event));
        event.detail.matchUrl(new RegExp(`^.+\/page2${urlSuffixRegex(urlSuffix)}$`), () => step3(event));
        event.detail.matchUrl(new RegExp(`^.+\/page3${urlSuffixRegex(urlSuffix)}$`), () => steps4and6(event));
        event.detail.matchUrl(new RegExp(`^.+\/page4${urlSuffixRegex(urlSuffix)}$`), () => step5(event));
        event.detail.matchUrl(new RegExp(`^.+\/error404${urlSuffixRegex(urlSuffix)}$`), () => step7(event));
    });

    function step1(event) {
        amountOfTestsRunned++;
        expect(amountOfTestsRunned).to.be.equal(1);
        let url = `http://localhost:9876/base/test/contents/page1${assertionSuffix(urlSuffix)}`;
        expect(event.detail.url).to.be.equal(url);
        expect(event.target).to.be.equal(root.querySelector('#content'));
        expect(event.detail.responseStatusCode).to.be.equal(200);
        expect(root.querySelector('#content .content').innerText).to.be.equal('page 1');
        root.querySelector('#content a').click();
    }

    function step2(event) {
        amountOfTestsRunned++;
        expect(amountOfTestsRunned).to.be.equal(2);
        let url = `http://localhost:9876/base/test/contents/page1/page1-2${assertionSuffix(urlSuffix)}`;
        expect(event.detail.url).to.be.equal(url);
        expect(event.target).to.be.equal(root.querySelector('#page-1-subcontent'));
        expect(event.detail.responseStatusCode).to.be.equal(200);
        expect(root.querySelector('#page-1-subcontent .content').innerText).to.be.equal('page 1-2');
        root.querySelector('#page-1-subcontent a').click();
    }

    function step3(event) {
        amountOfTestsRunned++;
        expect(amountOfTestsRunned).to.be.equal(3);
        let url = `http://localhost:9876/base/test/contents/page2${urlSuffix}`;
        expect(event.detail.url).to.be.equal(url);
        expect(event.target).to.be.equal(root.querySelector('#content'));
        expect(event.detail.responseStatusCode).to.be.equal(200);
        expect(root.querySelector('#content .content').innerText).to.be.equal('page 2');
        root.querySelector('#anchor3').click();
    }

    function steps4and6(event) {
        let url = `http://localhost:9876/base/test/contents/page3${urlSuffix}`;
        expect(event.detail.url).to.be.equal(url);
        expect(event.target).to.be.equal(root.querySelector('#content'));
        expect(event.detail.responseStatusCode).to.be.equal(200);
        expect(root.querySelector('#content .content').innerText).to.be.equal('page 3');

        amountOfTestsRunned++;
        page3Visits++;
        if (page3Visits === 2) {
            expect(amountOfTestsRunned).to.be.equal(6);
            root.querySelector('#error404anchor').click();
        } else {
            expect(amountOfTestsRunned).to.be.equal(4);
            root.querySelector('#anchor4').click();
        }
    }

    function step5(event) {
        amountOfTestsRunned++;
        expect(amountOfTestsRunned).to.be.equal(5);
        let url = `http://localhost:9876/base/test/contents/page4${urlSuffix}`;
        expect(event.detail.url).to.be.equal(url);
        expect(event.target).to.be.equal(root.querySelector('#content-2'));
        expect(event.detail.responseStatusCode).to.be.equal(200);
        expect(root.querySelector('#content-2 .content').innerText).to.be.equal('page 4');
        history.back();
    }

    function step7(event) {
        amountOfTestsRunned++;
        expect(amountOfTestsRunned).to.be.equal(7);
        let url = `http://localhost:9876/base/test/contents/error404${urlSuffix}`;
        expect(event.detail.url).to.be.equal(url);
        expect(event.target).to.be.equal(root.querySelector('#content'));
        expect(event.detail.responseStatusCode).to.be.equal(404);
        expect(root.querySelector('#content').innerText).to.be.equal('NOT FOUND');
        step8();
    }

    function step8() {
        let errorCalled = false;
        console.error = sinon.stub().callsFake(() => errorCalled = true);
        root.querySelector('#targetError').click();
        expect(errorCalled).to.be.true;
        sinon.restore();
        finish();
    }
}

function regexSuffix(urlSuffix = '') {
    return urlSuffix ? `-with-extensions\\${urlSuffix}` : '';
}

function assertionSuffix(urlSuffix = '') {
    return urlSuffix ? `-with-extensions${urlSuffix}` : '';
}

function urlSuffixRegex(urlSuffix = '') {
    return urlSuffix ? `\\${urlSuffix}` : '';
}
