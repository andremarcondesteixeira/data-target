import { enableAnchorsTargetSelectors } from '../src/hats.js';

describe('function enableAnchorsTargetSelectors', () => {
    it('should render content inside the first element found by a valid data-target-selector attribute', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <a href="/base/test/contents/test-content.html"
               data-target-selector="#test-element"></a>
            <div id="test-element">
                <!-- CONTENT SHOULD BE RENDERED HERE -->
            </div>`;

            enableAnchorsTargetSelectors(rootElement);

        return new Promise(resolve => {
            rootElement.addEventListener('hats:DOMContentLoaded', function onContentLoaded() {
                const targetTestContent = rootElement.querySelector('#test-element').querySelector('.test-content');
                expect(targetTestContent).to.not.be.null;
                rootElement.removeEventListener('hats:DOMContentLoaded', onContentLoaded);
                resolve();
            });

            rootElement.querySelector('a').click();
        });
    });
});
