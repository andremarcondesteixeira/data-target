const config = {
    urlTransformer: (url: string) => url,
    errorHandler: (error: unknown) => console.error(error),
    httpRequestDispatcher: async (url: string) => {
        const response = await fetch(url);
        return {
            content: await response.text(),
            statusCode: response.status
        };
    }
};

export default config;

window.addEventListener('popstate', event => tryLoadContent(location.href, event.state.targetId));
initialize(document.body);

function initialize(root: HTMLElement) {
    addClickListeners(root);
    let autoloadingAnchors: NodeListOf<HTMLAnchorElement> = root.querySelectorAll('a[data-autoload][data-target]:not([data-target=""])');
    autoloadingAnchors.forEach((anchor: HTMLAnchorElement) => anchor.click());
}

function addClickListeners(element: HTMLElement) {
    const anchors: NodeListOf<HTMLAnchorElement> = element.querySelectorAll('a[data-target]:not([data-target=""])');
    anchors.forEach((anchorElement: HTMLAnchorElement) => {
        anchorElement.addEventListener('click', handleClick);
    });

    const elementsWithDefaultTargetId: NodeListOf<HTMLElement> = element.querySelectorAll('[data-default-target]:not([data-default-target=""])');
    elementsWithDefaultTargetId.forEach((parentElement: HTMLElement) => {
        const links: NodeListOf<HTMLAnchorElement> = parentElement.querySelectorAll('a:not([data-target])');
        links.forEach((anchorElement: HTMLAnchorElement) => {
            anchorElement.setAttribute('data-target', parentElement.getAttribute('data-default-target') as string);
            anchorElement.addEventListener('click', handleClick);
        });
    });
}

function handleClick(event: MouseEvent) {
    event.preventDefault();
    const target = event.target as HTMLAnchorElement;
    const targetElementSelector = target.getAttribute('data-target') as string;
    history.pushState({ targetElementSelector }, "", target.href);
    tryLoadContent(target.href, targetElementSelector);
}

function tryLoadContent(url: string, targetElementSelector: string) {
    try {
        loadContent(url, targetElementSelector);
    } catch (error) {
        config.errorHandler(error);
    }
}

async function loadContent(url: string, targetElementSelector: string) {
    const targetElement = getTargetElement(url, targetElementSelector);
    const transformedUrl = config.urlTransformer(url);
    const response = await config.httpRequestDispatcher(transformedUrl);
    renderContentInsideTargetElement(targetElement, response.content);
    initialize(targetElement);
    const eventDetail: ContentLoadedEventDetail = { url, targetElementSelector, responseStatusCode: response.statusCode };
    dispatchContentLoadedEvent(targetElement, eventDetail);
}

function getTargetElement(url: string, targetElementSelector: string) {
    const targetElement = document.querySelector(targetElementSelector) as HTMLElement;
    if (!targetElement)
        throw new Error(`No element found for selector "${targetElementSelector}" to render response from ${url}`);
    return targetElement;
}

function renderContentInsideTargetElement(targetElement: HTMLElement, html: string) {
    while (targetElement.lastChild)
        targetElement.removeChild(targetElement.lastChild);
    targetElement.insertAdjacentHTML('afterbegin', html);
}

function dispatchContentLoadedEvent(targetElement: HTMLElement, detail: ContentLoadedEventDetail) {
    targetElement.dispatchEvent(new CustomEvent('HyperLinksPlusPlus:DOMContentLoaded', {
        bubbles: true,
        cancelable: true,
        detail
    }));
}

export type ContentLoadedEventDetail = {
    url: string;
    targetElementSelector: string;
    responseStatusCode: number;
};
