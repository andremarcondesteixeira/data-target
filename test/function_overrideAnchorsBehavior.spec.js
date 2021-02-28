import { overrideAnchorsBehavior } from '../src/index.js';
import { generateId, createTargetElement, createAnchors, createDivWith } from './helpers.mjs';

describe('function overrideAnchorsBehavior', () => {
    it('given non-empty data-target attribute, when data-target selector is processed, then it should render the content inside the first element found by the selector', () => {
        const targetId = generateId();
        const targetElement = createTargetElement(targetId);
        const anchors = createAnchors(`#${targetId}`);
        const rootElement = createDivWith(anchors);
        rootElement.appendChild(targetElement);
        overrideAnchorsBehavior(rootElement);
        anchors[1].click();

        return new Promise(resolve => {
            const onLoadPage = () => {
                const targetTestContent = targetElement.querySelector('.test-content');
                assert.isNotNull(targetTestContent);
                rootElement.removeEventListener('content-loaded', onLoadPage);
                resolve();
            };
            rootElement.addEventListener('content-loaded', onLoadPage);
        });
    });
});
