export function getAugmentedAnchorsFrom(parent) {
    return parent.querySelectorAll('a[data-target]:not([data-target=""]), a[data-module]:not([data-module=""])');
}

export function overrideAnchorsBehavior(rootElement, afterRender = function(){}) {
    const anchors = getAugmentedAnchorsFrom(rootElement);
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => onClick(event, rootElement, afterRender));
    });
}

async function onClick(event, rootElement, afterRender) {
    event.preventDefault();
    const anchor = event.currentTarget;
    await loadModule(anchor);
    await getContent(anchor, rootElement);
    afterRender();
}

async function getContent(anchor, rootElement) {
    const response = await fetch(anchor.href);
    const html = await response.text();
    setContentInTargetElement(rootElement, anchor, html);
}

function setContentInTargetElement(rootElement, anchor, html) {
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
    const event = new Event('content-loaded', {
        bubbles: true,
        cancelable: true
    });
    targetElement.dispatchEvent(event);
}

async function loadModule(anchor) {
    const modulePath = anchor.getAttribute('data-module')?.trim();
    if (modulePath)
        return import(modulePath);
    return null;
}
