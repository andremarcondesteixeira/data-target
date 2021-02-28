import { getAugmentedAnchorsFrom } from '../src/index.js';
import { buildContextWithAugmentedAndNonAugmentedAnchors } from './helpers.mjs';

describe('function getAugmentedAnchorsFrom', () => {
    it('selects all anchors with data-target and/or data-module attribute', () => {
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
        const selected = getAugmentedAnchorsFrom(context.rootElement);
        assert.equal(selected.length, 3);
    });
});
