let root;
let transformUrl = url => url;
let handleError = error => console.error(error);
let makeRequest = async url => {
    let response = await fetch(url);
    const content = await response.text();
    return {
        content,
        statusCode: response.status
    };
};

window.addEventListener('popstate', event => tryLoadContent(location.href, event.state.targetId));

export function configureNavigation(_root, config) {
    root = _root;

    if (typeof config?.urlTransformer === 'function')
        transformUrl = config.urlTransformer;

    if (typeof config?.errorHandler === 'function')
        handleError = config.errorHandler;

    if (typeof config?.httpRequestDispatcher === 'function')
        makeRequest = config.httpRequestDispatcher;

    start();
}

function start() {
    addClickListeners();
    root.querySelector('a[data-init]')?.click();
}

function addClickListeners() {
    root.querySelectorAll('a[data-target-id]:not([data-target-id=""])')
        .forEach(a => a.addEventListener('click', handleClick));

    root.querySelectorAll('[data-anchors-target-id]:not([data-anchors-target-id=""])').forEach(parentElement => {
        parentElement.querySelectorAll('a:not([data-target-id])').forEach(linkElement => {
            linkElement.setAttribute('data-target-id', parentElement.getAttribute('data-anchors-target-id'));
            linkElement.addEventListener('click', handleClick);
        });
    });
}

function handleClick(event) {
    event.preventDefault();
    const targetId = event.target.getAttribute('data-target-id');
    history.pushState({ targetId }, null, event.target.href);
    tryLoadContent(event.target.href, targetId);
}

async function tryLoadContent(url, targetId) {
    const targetElement = root.querySelector(`#${targetId}`);
    !!targetElement
        ? loadContent(url, targetElement)
        : handleError(new Error(`No element found with id: "${targetId}"`));
}

async function loadContent(url, targetElement) {
    try {
        const response = await makeRequest(transformUrl(url));
        renderContentInsideTargetElement(targetElement, response.content);
        addClickListeners(targetElement);
        dispatchContentLoadedEvent(targetElement, {
            url,
            responseStatusCode: response.statusCode
        });
    } catch (error) {
        handleError(error);
    }
}

function renderContentInsideTargetElement(targetElement, html) {
    while (targetElement.lastChild)
        targetElement.removeChild(targetElement.lastChild);
    targetElement.insertAdjacentHTML('afterbegin', html);
}

function dispatchContentLoadedEvent(targetElement, detail) {
    targetElement.dispatchEvent(new CustomEvent('hati:DOMContentLoaded', {
        bubbles: true,
        cancelable: true,
        detail: {
            ...detail,
            matchUrl: (regex, callback) => {
                if (regex.test(detail.url))
                    callback();
            }
        }
    }));
}
