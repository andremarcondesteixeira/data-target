window.addEventListener('popstate', event => tryLoadContent(location.href, event.state.targetId));
initialize(document.body);
const config = {
    urlTransformer: (url) => url,
    errorHandler: (error) => console.error(error),
    httpRequestDispatcher: async (url) => {
        const response = await fetch(url);
        return {
            content: await response.text(),
            statusCode: response.status
        };
    }
};
export default config;
function initialize(root) {
    addClickListeners(root);
    root.querySelector('a[data-init]')?.click();
}
function addClickListeners(element) {
    const links = element.querySelectorAll('a[data-target-id]:not([data-target-id=""])');
    links.forEach((a) => {
        a.addEventListener('click', handleClick);
    });
    const elementsWithDefaultTargetId = element.querySelectorAll('[data-default-target-id]:not([data-default-target-id=""])');
    elementsWithDefaultTargetId.forEach((parentElement) => {
        const links = parentElement.querySelectorAll('a:not([data-target-id])');
        links.forEach((linkElement) => {
            linkElement.setAttribute('data-target-id', parentElement.getAttribute('data-default-target-id'));
            linkElement.addEventListener('click', handleClick);
        });
    });
}
function handleClick(event) {
    event.preventDefault();
    const target = event.target;
    const targetId = target.getAttribute('data-target-id');
    history.pushState({ targetId }, "", target.href);
    tryLoadContent(target.href, targetId);
}
function tryLoadContent(url, targetId) {
    try {
        const targetElement = getTargetElement(url, targetId);
        loadContent(url, targetElement);
    }
    catch (error) {
        config.errorHandler(error);
    }
}
function getTargetElement(url, targetId) {
    const targetElement = document.querySelector(`#${targetId}`);
    if (!targetElement)
        throw new Error(`No element found with id "${targetId}" to render response from ${url}`);
    return targetElement;
}
async function loadContent(url, targetElement) {
    const response = await config.httpRequestDispatcher(config.urlTransformer(url));
    renderContentInsideTargetElement(targetElement, response.content);
    initialize(targetElement);
    dispatchContentLoadedEvent(targetElement, {
        url,
        responseStatusCode: response.statusCode
    });
}
function renderContentInsideTargetElement(targetElement, html) {
    while (targetElement.lastChild)
        targetElement.removeChild(targetElement.lastChild);
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
//# sourceMappingURL=hyperlinksPlusPlus.js.map