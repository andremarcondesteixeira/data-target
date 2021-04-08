import hati from '../src/hati.js';

describe('hati', () => {
    let lastUrlPassedToHistoryPushState;
    history.pushState = function (...args) {
        lastUrlPassedToHistoryPushState = args[2];
    };

    it('should replace content inside the element which the id is the same as the data-target-id attribute and dispatch a hati:DOMContentLoaded event', () => {
        return doTest({
            html: `
                <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
                <!-- CONTENT SHOULD BE RENDERED INSIDE THE ELEMENT BELOW -->
                <section id="content">
                    <p>This content will be replaced</p>
                </section>
            `,
            hatiDOMContentLoadedEventhandler: ({ finish, root, event }) => {
                expect(root.querySelector('#test-content').innerText).to.be.equal('Test content');
                const expectedUrl = 'http://localhost:9876/base/test/contents/test-content.html';
                expect(lastUrlPassedToHistoryPushState).to.be.equal(expectedUrl);
                expect(event.detail.responseStatusCode).to.be.equal(200);
                finish();
            }
        });
    });

    it('should enable data-target-id in nested anchors', () => {
        return doTest({
            html: `
                <a href="/base/test/contents/nested.html" data-target-id="content">anchor</a>
                <section id="content"></section>
            `,
            hatiDOMContentLoadedEventhandler: ({ finish, root }) => {
                root.querySelector('#outer-content').addEventListener('hati:DOMContentLoaded', () => {
                    expect(root.querySelector('#test-content').innerText).to.be.equal('Test content');
                    finish();
                });
                root.querySelector('#content a').click();
            },
            skipEventTargetAssertions: true
        });
    });

    it('should return 404 as responseStatusCode for inexisting pages', () => {
        return doTest({
            html: `
                <a href="/base/test/contents/inexisting.html" data-target-id="content">anchor</a>
                <section id="content"></section>
            `,
            hatiDOMContentLoadedEventhandler: ({ finish, event }) => {
                expect(event.detail.responseStatusCode).to.be.equal(404);
                finish();
            }
        });
    });

    it('should dispatch a hati:beforeLoad event before trying to load content', () => {
        return doTest({
            html:  `
                <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
                <div id="content"></div>
            `,
            hatiBeforeLoadEventHandler: ({ finish }) => {
                const expectedUrl = 'http://localhost:9876/base/test/contents/test-content.html';
                expect(lastUrlPassedToHistoryPushState).to.be.equal(expectedUrl);
                finish();
            }
        });
    });

    it('should log an error in the console and dispatch a hati:error event if data-target-id resolves to no element', () => {
        console.error = sinon.fake();
        return doTest({
            html: `<a href="/base/test/contents/test-content.html" data-target-id="non-existing-element">anchor</a>`,
            hatiBeforeLoadEventHandler: ({ finish }) => {
                const expectedUrl = 'http://localhost:9876/base/test/contents/test-content.html';
                expect(lastUrlPassedToHistoryPushState).to.be.equal(expectedUrl);
                finish();
            },
            hatiErrorEventHandler: ({ finish, event }) => {
                expect(event.detail.errorMessage).to.be.equal('No element found with id: non-existing-element');
                expect(console.error.callCount).to.be.equal(1);
                expect(console.error.firstArg).to.be.equal('No element found with id: non-existing-element');
                sinon.restore();
                finish();
            }
        });
    });

    it('should change the url without a page reload when an anchor is clicked', () => {
        return doTest({
            html: `
                <a href="/base/test/contents/test-content.html" data-target-id="content">anchor</a>
                <div id="content"></div>
            `,
            hatiBeforeLoadEventHandler: ({ finish }) => {
                const expectedUrl = 'http://localhost:9876/base/test/contents/test-content.html';
                expect(lastUrlPassedToHistoryPushState).to.be.equal(expectedUrl);
                finish();
            }
        });
    });

    it('should call a provided callback to build the actual url that will load documents based on the anchors href', () => {
        const router = sinon.spy(href => `${href}.html`);
        return doTest({
            html: `
                <a href="/base/test/contents/test-content" data-target-id="content">anchor</a>
                <div id="content"></div>
            `,
            hatiBeforeLoadEventHandler: ({ finish }) => {
                const expectedUrl = 'http://localhost:9876/base/test/contents/test-content';
                expect(lastUrlPassedToHistoryPushState).to.be.equal(expectedUrl);
                finish();
            },
            hatiDOMContentLoadedEventhandler: ({ finish, root }) => {
                expect(root.querySelector('#test-content').innerText).to.be.equal('Test content');
                expect(router.callCount).to.be.equal(1);
                finish();
            },
            config: { router }
        });
    });
});

function doTest({
    html,
    hatiBeforeLoadEventHandler,
    hatiDOMContentLoadedEventhandler,
    hatiErrorEventHandler,
    errorHandler,
    config,
    skipEventTargetAssertions
}) {
    const root = document.createElement('div');
    root.innerHTML = html;

    hati({ root, ...config });

    return new Promise(resolve => {
        let count = 0;
        const finish = () => {
            if (++count === 2)
                resolve();
        };

        root.addEventListener('hati:beforeLoad', event => {
            if (!skipEventTargetAssertions) {
                expect(event.target).to.be.equal(root.querySelector('a'));
            }
            if (typeof hatiBeforeLoadEventHandler === 'function') {
                hatiBeforeLoadEventHandler({ finish, root, event });
            } else finish();
        });

        root.addEventListener('hati:error', event => {
            if (!skipEventTargetAssertions) {
                expect(event.target).to.be.equal(root.querySelector('a'));
            }
            if (typeof hatiErrorEventHandler === 'function') {
                hatiErrorEventHandler({ finish, root, event });
            } else finish();
        });

        root.addEventListener('hati:DOMContentLoaded', event => {
            if (!skipEventTargetAssertions) {
                const targetId = root.querySelector('a').getAttribute('data-target-id');
                const targetElement = root.querySelector(`#${targetId}`);
                expect(event.target).to.be.equal(targetElement);
            }
            if (typeof hatiDOMContentLoadedEventhandler === 'function') {
                hatiDOMContentLoadedEventhandler({ finish, root, event });
            } else finish();
        });

        try {
            root.querySelector('a').click();
        } catch (error) {
            errorHandler(error);
        }
    });
}
