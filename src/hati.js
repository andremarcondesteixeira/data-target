export function initialize(rootElement) {
    const anchors = getAnchors(rootElement);
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => {
            dispatchBeforeLoadEvent(anchor);
            tryLoadContent(event, anchor, rootElement);
        });
    });
}

export function getAnchors(rootElement) {
    return rootElement.querySelectorAll('a[data-target-id]:not([data-target-id=""])');
}

function dispatchBeforeLoadEvent(anchor) {
    const event = new CustomEvent('hati:beforeLoad', {
        bubbles: true,
        cancelable: true,
        detail: {
            href: anchor.href
        }
    });
    anchor.dispatchEvent(event);
}

async function tryLoadContent(event, anchor, rootElement) {
    event.preventDefault();
    const targetElement = getTargetElement(anchor, rootElement);
    !!targetElement
        ? doLoadContent(anchor, targetElement)
        : console.error(`No element found with id: ${anchor.getAttribute('data-target-id')}`);
}

function getTargetElement(anchor, rootElement) {
    const targetElementId = anchor.getAttribute('data-target-id');
    const targetElement = rootElement.querySelector(`#${targetElementId}`);
    return targetElement;
}

async function doLoadContent(anchor, targetElement) {
    const response = await fetchContent(anchor);
    renderContentInTargetElement(targetElement, response.content);
    initialize(targetElement);
    dispatchContentLoadedEvent(targetElement, {
        href: anchor.href,
        responseStatusCode: response.statusCode
    });
}

async function fetchContent(anchor) {
    let response = await fetch(anchor.href);
    const content = await response.text();
    return {
        content,
        statusCode: response.status
    };
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
    const event = new CustomEvent('hati:DOMContentLoaded', {
        bubbles: true,
        cancelable: true,
        detail
    });
    targetElement.dispatchEvent(event);
}
