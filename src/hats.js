export function initialize(rootElement, beforeLoad = () => { }) {
    const anchors = getAnchors(rootElement);
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => {
            beforeLoad(anchor.href);
            tryLoadContent(event, anchor, rootElement);
        });
    });
}

export function getAnchors(parent) {
    return parent.querySelectorAll('a[data-target-selector]:not([data-target-selector=""])');
}

async function tryLoadContent(event, anchor, rootElement) {
    event.preventDefault();
    const targetElement = getTargetElement(anchor, rootElement);
    targetElement
        ? doLoadContent(anchor, targetElement)
        : console.error(`No element found with selector: ${anchor.getAttribute('data-target-selector')}`);
}

function getTargetElement(anchor, rootElement) {
    const targetSelector = anchor.getAttribute('data-target-selector');
    const targetElement = rootElement.querySelector(targetSelector);
    return targetElement;
}

async function doLoadContent(anchor, targetElement) {
    const content = await fetchContent(anchor);
    renderContentInTargetElement(targetElement, content);
    initialize(targetElement);
    dispatchContentLoadedEvent(targetElement, { href: anchor.href });
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
