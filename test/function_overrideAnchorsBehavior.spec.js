import { overrideAnchorsBehavior } from '../src/index.js';

describe('function overrideAnchorsBehavior', () => {
    it('should render content inside the first element found by a non-empty data-target selector', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/test-content.html"
               data-target="#test-element"></a>
            <div id="test-element">
                <!-- CONTENT SHOULD BE RENDERED HERE -->
            </div>
        `;

        overrideAnchorsBehavior(rootElement);
        rootElement.querySelector('a').click();

        return new Promise(resolve => {
            const onLoadPage = () => {
                const targetTestContent = rootElement.querySelector('#test-element').querySelector('.test-content');
                assert.isNotNull(targetTestContent);
                rootElement.removeEventListener('content-loaded', onLoadPage);
                resolve();
            };
            rootElement.addEventListener('content-loaded', onLoadPage);
        });
    });
});
