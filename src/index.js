export function getAugmentedAnchorsFrom(parent) {
    return parent.querySelectorAll('a[data-target], a[data-module]');
}

export function overrideAnchorsBehavior(rootElement) {
    const anchors = getAugmentedAnchorsFrom(rootElement);
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => onClick(event, rootElement));
    });
}

function onClick(event, rootElement) {
    event.preventDefault();
    const anchor = event.currentTarget;
    getContent(anchor, rootElement);
}

function getContent(anchor, rootElement) {
    fetch(anchor.href)
        .then(response => response.text())
        .then(html => setContentInTargetElement(rootElement, anchor, html));
}

function setContentInTargetElement(rootElement, anchor, html) {
    const targetSelector = anchor.getAttribute('data-target');
    const targetElement = rootElement.querySelector(targetSelector);
    clearTargetElement(targetElement);
    targetElement.insertAdjacentHTML('afterbegin', html);
    dispachContentLoadedEvent(targetElement);
}

function clearTargetElement(targetElement) {
    while(targetElement.lastChild) {
        targetElement.removeChild(targetElement.lastChild);
    }
}

function dispachContentLoadedEvent(targetElement) {
    const event = new Event('content-loaded', {
        bubbles: true,
        cancelable: true
    });
    targetElement.dispatchEvent(event);
    console.log(event);
}
