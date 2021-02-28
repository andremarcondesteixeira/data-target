import { overrideAnchorsBehavior } from '../src/index.js';
import { buildContextWithAugmentedAndNonAugmentedAnchors } from './helpers.mjs';

describe('function overrideAnchorsBehavior', () => {
    it('should render content inside the first element found by a non-empty data-target selector', () => {
        /*
            context's rootElement resulting HTML:
            <div>
                <a href="/base/test/test-content.html"></a>
                <a href="/base/test/test-content.html"
                   data-target="#test-element-1614547720868"></a>
                <a href="/base/test/test-content.html"
                   data-module="path/to/my/script.js"></a>
                <a href="/base/test/test-content.html"
                   data-target="#test-element-1614547720868"
                   data-module="path/to/my/script.js"></a>
                <div id="test-element-1614547720868"
                     style="display: none;">
                    <!-- CONTENT SHOULD BE RENDERED HERE -->
                </div>
            </div>
        */
        const context = buildContextWithAugmentedAndNonAugmentedAnchors();
        overrideAnchorsBehavior(context.rootElement);
        context.allAugmentedAndNonAugmentedAnchors[1].click();

        return new Promise(resolve => {
            const onLoadPage = () => {
                const targetTestContent = context.targetElement.querySelector('.test-content');
                assert.isNotNull(targetTestContent);
                context.rootElement.removeEventListener('content-loaded', onLoadPage);
                resolve();
            };
            context.rootElement.addEventListener('content-loaded', onLoadPage);
        });
    });
});
