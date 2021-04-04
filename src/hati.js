export function initialize(rootElement, options) {
    const anchors = getAnchors(rootElement);
    anchors.forEach(anchor => {
        anchor.addEventListener('click', event => {
            dispatchBeforeLoadEvent(anchor);
            history.pushState({}, null, anchor.href);
            tryLoadContent(event, anchor, rootElement, options ?? {});
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

async function tryLoadContent(event, anchor, rootElement, options) {
    event.preventDefault();
    const targetElement = getTargetElement(anchor, rootElement);
    !!targetElement
        ? doLoadContent(anchor, targetElement, options)
        : handleError(anchor);
}

function getTargetElement(anchor, rootElement) {
    const targetElementId = anchor.getAttribute('data-target-id');
    const targetElement = rootElement.querySelector(`#${targetElementId}`);
    return targetElement;
}

async function doLoadContent(anchor, targetElement, options) {
    const href = options?.router ? options.router(anchor.href) : anchor.href;
    const response = await fetchContent(href);
    renderContentInTargetElement(targetElement, response.content);
    initialize(targetElement);
    dispatchContentLoadedEvent(targetElement, {
        href: anchor.href,
        responseStatusCode: response.statusCode
    });
}

async function fetchContent(href) {
    let response = await fetch(href);
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

function handleError(anchor) {
    const errorMessage = `No element found with id: ${anchor.getAttribute('data-target-id')}`;
    const event = new CustomEvent('hati:error', {
        bubbles: true,
        cancelable: true,
        detail: {
            href: anchor.href,
            errorMessage
        }
    });
    anchor.dispatchEvent(event);
    return console.error(errorMessage);
}
