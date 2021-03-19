export function getAugmentedAnchorsFrom(parent) {
    return parent.querySelectorAll('a[data-target-selector]:not([data-target-selector=""])');
}

export function overrideAnchorsBehavior(rootElement) {
    const anchors = getAugmentedAnchorsFrom(rootElement);
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => onClick(event, anchor, rootElement));
    });
}

async function onClick(event, anchor, rootElement) {
    event.preventDefault();
    await loadModule(anchor);
    const content = await fetchContent(anchor);
    renderContentInTargetElement(rootElement, anchor, content);
}

async function loadModule(anchor) {
    const modulePath = anchor.getAttribute('data-module')?.trim();

    if (modulePath) {
        try {
            return await import(modulePath);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return null;
}

async function fetchContent(anchor) {
    let response = await fetch(anchor.href);
    return await response.text();
}

function renderContentInTargetElement(rootElement, anchor, html) {
    const targetSelector = anchor.getAttribute('data-target');
    const targetElement = rootElement.querySelector(targetSelector);
    clearTargetElement(targetElement);
    targetElement.insertAdjacentHTML('afterbegin', html);
    dispachContentLoadedEvent(targetElement);
}

function clearTargetElement(targetElement) {
    while (targetElement.lastChild) {
        targetElement.removeChild(targetElement.lastChild);
    }
}

function dispachContentLoadedEvent(targetElement) {
    const event = new CustomEvent('content-loaded', {
        bubbles: true,
        cancelable: true
    });
    targetElement.dispatchEvent(event);
}
