export function getAnchors(parent) {
    return parent.querySelectorAll('a[data-selector-target]:not([data-selector-target=""])');
}

export function enableAnchorSelectorTarget(rootElement) {
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
    const targetSelector = anchor.getAttribute('data-selector-target');
    const targetElement = rootElement.querySelector(targetSelector);
    clearTargetElement(targetElement);
    targetElement.insertAdjacentHTML('afterbegin', html);
    dispatchContentLoadedEvent(targetElement);
}

function clearTargetElement(targetElement) {
    while (targetElement.lastChild) {
        targetElement.removeChild(targetElement.lastChild);
    }
}

function dispatchContentLoadedEvent(targetElement) {
    const event = new CustomEvent('content-loaded', {
        bubbles: true,
        cancelable: true
    });
    targetElement.dispatchEvent(event);
}
