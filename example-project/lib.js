let rootElement = document;
let transformUrl = url => url;
let handleError = error => console.error(error);
let makeRequest = async url => {
    const response = await fetch(url);
    return {
        content: await response.text(),
        statusCode: response.status
    };
};

window.addEventListener('popstate', event => tryLoadContent(location.href, event.state.targetId));

export function configureNavigation(config) {
    if (typeof config?.rootElement === HTMLElement) rootElement = config.rootElement;
    if (typeof config?.urlTransformer === 'function') transformUrl = config.urlTransformer;
    if (typeof config?.errorHandler === 'function') handleError = config.errorHandler;
    if (typeof config?.httpRequestDispatcher === 'function') makeRequest = config.httpRequestDispatcher;
    addClickListeners(rootElement);
    rootElement.querySelector('a[data-init]')?.click();
}

function addClickListeners(element) {
    element.querySelectorAll('a[data-target-id]:not([data-target-id=""])').forEach(a => a.addEventListener('click', handleClick));
    element.querySelectorAll('[data-default-target-id]:not([data-default-target-id=""])').forEach(parentElement => {
        parentElement.querySelectorAll('a:not([data-target-id])').forEach(linkElement => {
            linkElement.setAttribute('data-target-id', parentElement.getAttribute('data-default-target-id'));
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
    try {
        const targetElement = rootElement.querySelector(`#${targetId}`);
        if (!targetElement) return handleError(new Error(`No element found with id "${targetId}" to render response from ${url}`));
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
    while (targetElement.lastChild) targetElement.removeChild(targetElement.lastChild);
    targetElement.insertAdjacentHTML('afterbegin', html);
}

function dispatchContentLoadedEvent(targetElement, detail) {
    targetElement.dispatchEvent(new CustomEvent('content-loaded', {
        bubbles: true,
        cancelable: true,
        detail: {
            ...detail,
            matchUrl: (urlRegex, callback) => {
                if (urlRegex.test(detail.url))
                    callback();
            }
        }
    }));
}
