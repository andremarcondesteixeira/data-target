import { overrideAnchorsBehavior } from '../src/augmented-anchors.js';
import { setListenerForTestModule, getCount } from './contents/test-module.js';

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

        return doTest(rootElement, getTrigger(rootElement), finish => {
            const targetTestContent = rootElement.querySelector('#test-element').querySelector('.test-content');
            assert.isNotNull(targetTestContent);
            finish();
        });
    });

    it('should load a javascript module after content is rendered when both data-target and data-module attributes are valid', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html"
               data-target="#test-element"
               data-module="base/test/contents/test-module.js"></a>
            <div id="test-element">
                <!-- CONTENT SHOULD BE RENDERED HERE -->
            </div>`;

        setListenerForTestModule(rootElement);
        overrideAnchorsBehavior(rootElement);

        return doTest(rootElement, getTrigger(rootElement), finish => {
            assert.equal(1, getCount());
            finish();
        });
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

    function getTrigger(rootElement) {
        return () => rootElement.querySelector('a').click();
    }
});
