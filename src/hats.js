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
    const targetElement = getTargetElement(anchor, rootElement);
    targetElement
        ? handleClick(anchor, targetElement)
        : console.error(`No element found with selector: ${anchor.getAttribute('data-target-selector')}`);
}

async function handleClick(anchor, targetElement) {
    const content = await fetchContent(anchor);
    renderContentInTargetElement(targetElement, content);
    enableAnchorsTargetSelectors(targetElement);
    dispatchContentLoadedEvent(targetElement, { href: anchor.href });
}

function getTargetElement(anchor, rootElement) {
    const targetSelector = anchor.getAttribute('data-target-selector');
    const targetElement = rootElement.querySelector(targetSelector);
    return targetElement;
}

async function fetchContent(anchor) {
    let response = await fetch(anchor.href);
    const content = await response.text();
    return content;
}

function renderContentInTargetElement(targetElement, html) {
    clearTargetElement(targetElement);
    targetElement.insertAdjacentHTML('afterbegin', html);
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
