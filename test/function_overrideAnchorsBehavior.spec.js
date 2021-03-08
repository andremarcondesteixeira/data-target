import { overrideAnchorsBehavior } from '../src/augmented-anchors.js';
import { callme } from './test-module.js';

describe('function overrideAnchorsBehavior', () => {
    it('should render content inside the first element found by a valid data-target selector', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/test-content.html"
               data-target="#test-element"></a>
            <div id="test-element">
                <!-- CONTENT SHOULD BE RENDERED HERE -->
            </div>`;

        overrideAnchorsBehavior(rootElement);
        rootElement.querySelector('a').click();

        return doTest(rootElement, () => {
            const targetTestContent = rootElement.querySelector('#test-element').querySelector('.test-content');
            assert.isNotNull(targetTestContent);
        });
    });

    function doTest(rootElement, callback) {
        return new Promise(resolve => {
            rootElement.addEventListener('content-loaded', function onContentLoaded() {
                callback();
                rootElement.removeEventListener('content-loaded', onContentLoaded);
                resolve();
            });
        });
    }
});
