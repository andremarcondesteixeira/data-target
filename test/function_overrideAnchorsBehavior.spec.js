import { enableDataTargetSelector } from '../src/html-anchor-data-target-selector.js';

describe('function overrideAnchorsBehavior', () => {
    it('should render content inside the first element found by a valid data-target selector', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html"
               data-target-selector="#test-element"></a>
            <div id="test-element">
                <!-- CONTENT SHOULD BE RENDERED HERE -->
            </div>`;

        enableDataTargetSelector(rootElement);

        return new Promise(resolve => {
            rootElement.addEventListener('content-loaded', function onContentLoaded() {
                const targetTestContent = rootElement.querySelector('#test-element').querySelector('.test-content');
                expect(targetTestContent).to.not.be.null;
                rootElement.removeEventListener('content-loaded', onContentLoaded);
                resolve();
            });

            rootElement.querySelector('a').click();
        });
    });
});
