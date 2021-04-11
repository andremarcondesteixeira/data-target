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

        <!- the data-init attribute in the anchor below should be ignored -->
        <a href="/base/test/contents/page3${urlSuffix}"
           id="anchor3"
           data-target-id="inexistent-section"
           data-init>Page 3 to inexistent section</a>

        <a href="/base/test/contents/inexistent${urlSuffix}"
           id="error404Anchor"
           data-target-id="content">Page 2</a>

        <nav data-anchors-target-id="content">
            <a href="/base/test/contents/page4${urlSuffix}"
               id="anchor4">Page 4</a>

            <a href="/base/test/contents/page5${urlSuffix}"
               id="anchor5">Page 5</a>

            <a href="/base/test/contents/page6${urlSuffix}"
               id="anchor6"
               data-target-id="content-2">Page 6</a>
        </nav>

        <div id="content"></div>
        <div id="content-2"></div>
    `;
    return root;
}

function createRootWithoutDataInit(urlSuffix = '') {
    const root = createRoot(urlSuffix);
    root.querySelector('#anchor1').removeAttribute('data-init');
    root.querySelector('#anchor3').removeAttribute('data-init');
    return root;
}

function prepareTest(root, resolve, urlSuffix = '') {
    let amountOfTestsRunned = 0;

    root.addEventListener('hati:beforeLoad', event => {
        event.detail.matchUrl(new RegExp(`^.+\/page1${regexSuffix(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned, 'saporra').to.be.equal(1);
            let url = `http://localhost:9876/base/test/contents/page1${assertionSuffix(urlSuffix)}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#anchor1'));
        });

        event.detail.matchUrl(new RegExp(`^.+\/page1\/page1-2${regexSuffix(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(3);
            let url = `http://localhost:9876/base/test/contents/page1/page1-2${assertionSuffix(urlSuffix)}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#content a'));
        });

        event.detail.matchUrl(new RegExp(`^.+\/page2${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(5);
            let url = `http://localhost:9876/base/test/contents/page2${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#page-1-subcontent a'));
        });

        event.detail.matchUrl(new RegExp(`^.+\/page3${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(7);
            let url = `http://localhost:9876/base/test/contents/page3${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#anchor3'));
        });

        event.detail.matchUrl(new RegExp(`^.+\/inexistent${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(9);
            let url = `http://localhost:9876/base/test/contents/inexistent${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#error404Anchor'));
        });

        event.detail.matchUrl(new RegExp(`^.+\/page4${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(11);
            let url = `http://localhost:9876/base/test/contents/page4${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#anchor4'));
        });

        event.detail.matchUrl(new RegExp(`^.+\/page5${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(13);
            let url = `http://localhost:9876/base/test/contents/page5${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#anchor5'));
        });

        event.detail.matchUrl(new RegExp(`^.+\/page6${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(15);
            let url = `http://localhost:9876/base/test/contents/page6${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#anchor6'));
        });
    });

    root.addEventListener('hati:DOMContentLoaded', event => {
        event.detail.matchUrl(new RegExp(`^.+\/page1${regexSuffix(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(2);
            let url = `http://localhost:9876/base/test/contents/page1${assertionSuffix(urlSuffix)}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content .content').innerText).to.be.equal('page 1');
            root.querySelector('#content a').click();
        });

        event.detail.matchUrl(new RegExp(`^.+\/page1\/page1-2${regexSuffix(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(4);
            let url = `http://localhost:9876/base/test/contents/page1/page1-2${assertionSuffix(urlSuffix)}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#page-1-subcontent'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#page-1-subcontent .content').innerText).to.be.equal('page 1-2');
            root.querySelector('#page-1-subcontent a').click();
        });

        event.detail.matchUrl(new RegExp(`^.+\/page2${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(6);
            let url = `http://localhost:9876/base/test/contents/page2${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content .content').innerText).to.be.equal('page 2');
            root.querySelector('#anchor3').click();
        });

        event.detail.matchUrl(new RegExp(`^.+\/inexistent${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(10);
            let url = `http://localhost:9876/base/test/contents/inexistent${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(404);
            expect(root.querySelector('#content').innerText).to.be.equal('NOT FOUND');
            root.querySelector('#anchor4').click();
        });

        event.detail.matchUrl(new RegExp(`^.+\/page4${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(12);
            let url = `http://localhost:9876/base/test/contents/page4${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content .content').innerText).to.be.equal('page 4');
            root.querySelector('#anchor5').click();
        });

        event.detail.matchUrl(new RegExp(`^.+\/page5${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(14);
            let url = `http://localhost:9876/base/test/contents/page5${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#content'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content .content').innerText).to.be.equal('page 5');
            root.querySelector('#anchor6').click();
        });

        event.detail.matchUrl(new RegExp(`^.+\/page6${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(16);
            let url = `http://localhost:9876/base/test/contents/page6${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#content-2'));
            expect(event.detail.responseStatusCode).to.be.equal(200);
            expect(root.querySelector('#content-2 .content').innerText).to.be.equal('page 6');
            resolve();
        });
    });

    root.addEventListener('hati:error', event => {
        event.detail.matchUrl(new RegExp(`^.+\/page3${urlSuffixRegex(urlSuffix)}$`), () => {
            amountOfTestsRunned++;
            expect(amountOfTestsRunned).to.be.equal(8);
            let url = `http://localhost:9876/base/test/contents/page3${urlSuffix}`;
            expect(event.detail.href).to.be.equal(url);
            expect(event.target).to.be.equal(root.querySelector('#anchor3'));
            expect(event.detail.errorMessage).to.be.equal('No element found with id: inexistent-section');
            root.querySelector('#error404Anchor').click();
        });
    });
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
