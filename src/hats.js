export function getAnchors(parent) {
    return parent.querySelectorAll('a[data-target-selector]:not([data-target-selector=""])');
}

export function enableAnchorsTargetSelectors(rootElement) {
    const anchors = getAnchors(rootElement);
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => onClick(event, anchor, rootElement));
    });
}

async function onClick(event, anchor, rootElement) {
    event.preventDefault();
    const content = await fetchContent(anchor);
    renderContentInTargetElement(rootElement, anchor, content);
}

async function fetchContent(anchor) {
    let response = await fetch(anchor.href);
    return await response.text();
}

function renderContentInTargetElement(rootElement, anchor, html) {
    const targetSelector = anchor.getAttribute('data-target-selector');
    const targetElement = rootElement.querySelector(targetSelector);
    clearTargetElement(targetElement);
    targetElement.insertAdjacentHTML('afterbegin', html);
    enableAnchorsTargetSelectors(targetElement);
    dispatchContentLoadedEvent(targetElement, { href: anchor.href });
}

function clearTargetElement(targetElement) {
    while (targetElement.lastChild) {
        targetElement.removeChild(targetElement.lastChild);
    }
}

function dispatchContentLoadedEvent(targetElement, detail) {
    const event = new CustomEvent('hats:DOMContentLoaded', {
        bubbles: true,
        cancelable: true,
        detail
    });
    targetElement.dispatchEvent(event);
}
