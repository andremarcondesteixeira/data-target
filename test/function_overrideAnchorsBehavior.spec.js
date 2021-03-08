import { overrideAnchorsBehavior } from '../src/augmented-anchors.js';

describe('function overrideAnchorsBehavior', () => {
    it('should render content inside the first element found by a valid data-target selector', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html"
               data-target="#test-element"></a>
            <div id="test-element">
                <!-- CONTENT SHOULD BE RENDERED HERE -->
            </div>`;

        overrideAnchorsBehavior(rootElement);

        const trigger = () => rootElement.querySelector('a').click();
        const test = finish => {
            const targetTestContent = rootElement.querySelector('#test-element').querySelector('.test-content');
            assert.isNotNull(targetTestContent);
            finish();
        };

        return doTest(rootElement, trigger, test);
    });

    xit('should load a javascript module after content is rendered when both data-target and data-module attributes are valid', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html"
               data-target="#test-element"
               data-module="base/test/contents/test-module.js"></a>
            <div id="test-element">
                <!-- CONTENT SHOULD BE RENDERED HERE -->
            </div>`;
        const spy = sinon.spy(callMe);
        setListenerForTestModule(rootElement);
        overrideAnchorsBehavior(rootElement);
        const trigger = () => rootElement.querySelector('a').click();
        const test = finish => {
            assert.equal(1, spy.callCount);
            finish();
        };

        return doTest(rootElement, trigger, test);
    });

    function doTest(rootElement, trigger, testsCallback) {
        return new Promise(resolve => {
            rootElement.addEventListener('content-loaded', function onContentLoaded() {
                testsCallback(() => {
                    rootElement.removeEventListener('content-loaded', onContentLoaded);
                    resolve();
                });
            });

            trigger();
        });
    }
});
