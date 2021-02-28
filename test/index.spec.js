import { getAugmentedAnchorsFrom, overrideAnchorsBehavior } from '../src/index.js';

describe('function getAugmentedAnchorsFrom', () => {
    function createAnchor(extraAttributes = {}) {
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.target = '_self';
        for (let attribute in extraAttributes) {
            anchor.setAttribute(attribute, extraAttributes[attribute]);
        }
        return anchor;
    }

    function createDivWith(anchors) {
        const div = document.createElement('div');
        anchors.forEach(anchor => div.appendChild(anchor));
        return div;
    }

    it('selects all anchors with data-target and/or data-module attribute', () => {
        const anchors = [
            createAnchor(),
            createAnchor({ 'data-target': '#my-element-id' }),
            createAnchor({ 'data-module': 'path/to/my/script.js' }),
            createAnchor({ 'data-target': '#my-element-id', 'data-module': 'path/to/my/script.js' })
        ];
        const container = createDivWith(anchors);
        const selected = getAugmentedAnchorsFrom(container);
        assert.equal(selected.length, 3);
    });
});

describe('function overrideAnchorsBehavior for anchors with data-target attribute', () => {
    function generateId() {
        const now = Date.now();
        const id = `test-element-${now}`;
        return id;
    }

    function createTargetElement(id) {
        const target = document.createElement('div');
        target.id = id;
        target.style.display = 'none';
        return target;
    }

    function createAnchors(targetSelector) {
        const anchors = [
            createAnchor(),
            createAnchor({ 'data-target': targetSelector }),
            createAnchor({ 'data-module': 'path/to/my/script.js' }),
            createAnchor({ 'data-target': targetSelector, 'data-module': 'path/to/my/script.js' })
        ];
        return anchors;
    }

    function createAnchor(extraAttributes = {}) {
        const anchor = document.createElement('a');
        anchor.href = '/base/test/test-content.html';
        anchor.target = '_self';
        for (let attribute in extraAttributes) {
            anchor.setAttribute(attribute, extraAttributes[attribute]);
        }
        return anchor;
    }

    function createDivWith(anchors) {
        const div = document.createElement('div');
        anchors.forEach(anchor => div.appendChild(anchor));
        return div;
    }

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
        })
    });
});
