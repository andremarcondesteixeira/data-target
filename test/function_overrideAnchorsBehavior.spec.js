import { overrideAnchorsBehavior } from '../src/index.js';
import { generateId, createTargetElement, createAnchors, createDivWith } from './helpers.mjs';

describe('function overrideAnchorsBehavior for anchors with data-target attribute', () => {
    it('renders the content of pages referred by the anchors in the first element found when applying the selector in the data-target attribute', () => {
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
