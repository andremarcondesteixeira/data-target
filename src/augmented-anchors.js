export function getAugmentedAnchorsFrom(parent) {
    return parent.querySelectorAll('a[data-target]:not([data-target=""]), a[data-module]:not([data-module=""])');
}

export function overrideAnchorsBehavior(rootElement) {
    const anchors = getAugmentedAnchorsFrom(rootElement);
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => onClick(event, rootElement));
    });
}

async function onClick(event, rootElement) {
    event.preventDefault();
    await loadModule(event.currentTarget);
    await loadContent(event.currentTarget, rootElement);
    dispachContentLoadedEvent(targetElement);
}

async function loadModule(anchor) {
    const modulePath = anchor.getAttribute('data-module')?.trim();

    if (modulePath) {
        try {
            return import(modulePath);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return null;
}

async function loadContent(anchor, rootElement) {
    const response = await fetch(anchor.href);
    const html = await response.text();
    renderContentInTargetElement(rootElement, anchor, html);
}

function renderContentInTargetElement(rootElement, anchor, html) {
    const targetSelector = anchor.getAttribute('data-target');
    const targetElement = rootElement.querySelector(targetSelector);
    clearTargetElement(targetElement);
    targetElement.insertAdjacentHTML('afterbegin', html);
}

function clearTargetElement(targetElement) {
    while (targetElement.lastChild) {
        targetElement.removeChild(targetElement.lastChild);
    }
}

function dispachContentLoadedEvent(targetElement) {
    const event = new Event('content-loaded', {
        bubbles: true,
        cancelable: true
    });
    targetElement.dispatchEvent(event);
}
