export function buildContextWithAugmentedAndNonAugmentedAnchors() {
    const targetId = generateId();
    const targetElement = createTargetElement(targetId);
    const allAugmentedAndNonAugmentedAnchors = createAugmentedAndNonAugmentedAnchors(`#${targetId}`);
    const rootElement = createDivWithAnchors(allAugmentedAndNonAugmentedAnchors);
    rootElement.appendChild(targetElement);
    return {
        targetId,
        targetElement,
        allAugmentedAndNonAugmentedAnchors,
        rootElement
    }
}

export function generateId() {
    const now = Date.now();
    const id = `test-element-${now}`;
    return id;
}

export function createTargetElement(id) {
    const target = document.createElement('div');
    target.id = id;
    target.style.display = 'none';
    return target;
}

export function createAugmentedAndNonAugmentedAnchors(targetSelector) {
    const anchors = [
        createAnchor(),
        createAnchor({ 'data-target': targetSelector }),
        createAnchor({ 'data-module': 'path/to/my/script.js' }),
        createAnchor({ 'data-target': targetSelector, 'data-module': 'path/to/my/script.js' })
    ];
    return anchors;
}

export function createAnchor(extraAttributes = {}) {
    const anchor = document.createElement('a');
    anchor.href = '/base/test/test-content.html';
    anchor.target = '_self';
    for (let attribute in extraAttributes) {
        anchor.setAttribute(attribute, extraAttributes[attribute]);
    }
    return anchor;
}

export function createDivWithAnchors(anchors) {
    const div = document.createElement('div');
    anchors.forEach(anchor => div.appendChild(anchor));
    return div;
}
