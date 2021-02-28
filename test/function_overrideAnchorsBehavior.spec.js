import { overrideAnchorsBehavior } from '../src/index.js';
import { buildContextWithAugmentedAndNonAugmentedAnchors } from './helpers.mjs';

describe('function overrideAnchorsBehavior', () => {
    it('should render content inside the first element found by a non-empty data-target selector', () => {
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
