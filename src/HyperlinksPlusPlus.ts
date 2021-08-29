window.addEventListener('popstate', event => tryLoadContent(location.href, event.state.targetId));
initialize(document.body);

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

function initialize(root: HTMLElement) {
    addClickListeners(root);
    (root.querySelector('a[data-init]') as HTMLAnchorElement)?.click();
}

function addClickListeners(element: HTMLElement) {
    const links: NodeListOf<HTMLAnchorElement> = element.querySelectorAll('a[data-target]:not([data-target=""])');
    links.forEach((a: HTMLAnchorElement) => {
        a.addEventListener('click', handleClick);
    });

    const elementsWithDefaultTargetId: NodeListOf<HTMLElement> = element.querySelectorAll('[data-default-target]:not([data-default-target=""])');
    elementsWithDefaultTargetId.forEach((parentElement: HTMLElement) => {
        const links: NodeListOf<HTMLAnchorElement> = parentElement.querySelectorAll('a:not([data-target])');
        links.forEach((linkElement: HTMLAnchorElement) => {
            linkElement.setAttribute('data-target', parentElement.getAttribute('data-default-target') as string);
            linkElement.addEventListener('click', handleClick);
        });
    });
}

function handleClick(event: MouseEvent) {
    event.preventDefault();
    const target = event.target as HTMLAnchorElement;
    const targetId = target.getAttribute('data-target') as string;
    history.pushState({ targetId }, "", target.href);
    tryLoadContent(target.href, targetId);
}

function tryLoadContent(url: string, targetId: string) {
    try {
        const targetElement = getTargetElement(url, targetId);
        loadContent(url, targetElement);
    } catch (error) {
        config.errorHandler(error);
    }
}

function getTargetElement(url: string, targetId: string) {
    const targetElement = document.querySelector(`#${targetId}`) as HTMLElement;
    if (!targetElement)
        throw new Error(`No element found with id "${targetId}" to render response from ${url}`);
    return targetElement;
}

async function loadContent(url: string, targetElement: HTMLElement) {
    const response = await config.httpRequestDispatcher(config.urlTransformer(url));
    renderContentInsideTargetElement(targetElement, response.content);
    initialize(targetElement);
    dispatchContentLoadedEvent(targetElement, {
        url,
        responseStatusCode: response.statusCode
    });
}

function renderContentInsideTargetElement(targetElement: HTMLElement, html: string) {
    while (targetElement.lastChild)
        targetElement.removeChild(targetElement.lastChild);
    targetElement.insertAdjacentHTML('afterbegin', html);
}

function dispatchContentLoadedEvent(targetElement: HTMLElement, detail: ContentLoadedEventDetail) {
    targetElement.dispatchEvent(new CustomEvent('content-loaded', {
        bubbles: true,
        cancelable: true,
        detail: {
            ...detail,
            matchUrl: (urlRegex: RegExp, callback: Function) => {
                if (urlRegex.test(detail.url))
                    callback();
            }
        }
    }));
}

type ContentLoadedEventDetail = {
    url: string;
    responseStatusCode: number;
};
