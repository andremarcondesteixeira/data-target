/// <reference path="data-target.d.ts" />

(() => {
    window.dataTarget = {
        config: {
            errorHandler: defaultErrorHandler,
            httpRequestDispatcher: defaultHttpRequestDispatcher,
        },
        $: {
            request,
            attach,
        }
    };

    Object.freeze(window.dataTarget.$);

    attach(document.body);

    function defaultErrorHandler(error: unknown, urlOrInvokerElement?: string | URL | HTMLAnchorElement | HTMLFormElement) {
        console.error({ error, urlOrInvokerElement });
    }

    async function defaultHttpRequestDispatcher(input: RequestInfo | URL, init?: RequestInit) {
        const response = await fetch(input, init);
        return {
            content: await response.text(),
            statusCode: response.status,
        };
    }

    async function request(
        urlOrInvokerElement: string | URL | HTMLAnchorElement | HTMLFormElement,
        targetElementId?: string,
        init?: RequestInit
    ) {
        try {
            if (
                typeof urlOrInvokerElement !== 'string'
                && !(urlOrInvokerElement instanceof URL)
                && !(urlOrInvokerElement instanceof HTMLAnchorElement)
                && !(urlOrInvokerElement instanceof HTMLFormElement)
            ) {
                throw new Error('The first parameter of the request function must be of one of the following types: string, URL, HTMLAnchorElement, HTMLFormElement');
            }

            if (typeof urlOrInvokerElement === 'string' || urlOrInvokerElement instanceof URL) {
                if (!targetElementId) {
                    throw new Error('When passing a URL object or a string in the first parameter of the request function, a second parameter containing the target element id is mandatory, but it was not provided');
                }

                return loadContent(urlOrInvokerElement, {
                    id: targetElementId,
                }, init);
            }

            if (!urlOrInvokerElement.hasAttribute('data-target')) {
                if (!targetElementId) {
                    throw new Error('When an element without the data-target property is passed in the first parameter of the request function, a second parameter containing the target element id is mandatory, but it was not provided');
                }

                return loadContent(urlOrInvokerElement, {
                    id: targetElementId,
                }, init);
            }

            if (urlOrInvokerElement instanceof HTMLAnchorElement) {
                return loadContent(urlOrInvokerElement, {
                    id: urlOrInvokerElement.href,
                }, init);
            }

            return loadContent(urlOrInvokerElement, {
                id: urlOrInvokerElement.action,
            }, init);
        } catch (error) {
            window.dataTarget.config.errorHandler(error, urlOrInvokerElement);
        }
    }

    function attach(root: HTMLElement) {
        root.querySelectorAll<HTMLAnchorElement>('a[data-target]:not([data-target=""])')
            .forEach(anchor => anchor.addEventListener('click', event => {
                event.preventDefault();
                loadContent(anchor, { id: anchor.getAttribute('data-target')! });
            }));

        root.querySelectorAll<HTMLFormElement>('form[data-target]:not([data-target=""])')
            .forEach(form => form.addEventListener('submit', event => {
                event.preventDefault();
                loadContent(form, { id: form.getAttribute('data-target')! });
            }));
    }

    async function loadContent(
        urlOrInvokerElement: string | URL | HTMLAnchorElement | HTMLFormElement,
        elementLocator: ElementLocator,
        init?: RequestInit,
    ) {
        try {
            if (typeof urlOrInvokerElement === 'string') {
                urlOrInvokerElement = new URL(urlOrInvokerElement);
            }
    
            const targetElement = getTargetElement(elementLocator);
            const url = getUrl(urlOrInvokerElement);
    
            targetElement.dispatchEvent(new CustomEvent('data-target:before-load', {
                bubbles: true,
                detail: {
                    url: url.href,
                },
            }));
    
            const response = await dispatchRequest(urlOrInvokerElement, init);
    
            renderContentInsideTargetElement(targetElement, {
                html: response.content
            });
            attach(targetElement);
    
            targetElement.dispatchEvent(new CustomEvent('data-target:loaded', {
                bubbles: true,
                detail: {
                    url: url.href,
                    responseStatusCode: response.statusCode
                }
            }));
        } catch(error) {
            window.dataTarget.config.errorHandler(error, urlOrInvokerElement)
        }
    }

    function getTargetElement(elementLocator: ElementLocator) {
        const targetElement = document.getElementById(elementLocator.id);
        if (targetElement === null) {
            throw new Error(`data-target: No target element found with ID "${elementLocator.id}"`);
        }
        return targetElement;
    }

    function renderContentInsideTargetElement(targetElement: HTMLElement, htmlContainer: HTMLContainer) {
        while (targetElement.lastChild) {
            targetElement.removeChild(targetElement.lastChild);
        }
        targetElement.insertAdjacentHTML('afterbegin', htmlContainer.html);
    }

    function dispatchRequest(urlOrInvokerElement: URL | HTMLAnchorElement | HTMLFormElement, init?: RequestInit) {
        const url = getUrl(urlOrInvokerElement);

        if (urlOrInvokerElement instanceof HTMLAnchorElement) {
            return window.dataTarget.config.httpRequestDispatcher(url, init);
        }

        if (urlOrInvokerElement instanceof HTMLFormElement) {
            const method = urlOrInvokerElement.method;
            const body = new FormData(urlOrInvokerElement);

            if (method.toLowerCase() === 'get') {
                return dispatchGETRequestForForm(urlOrInvokerElement, body);
            } else {
                return window.dataTarget.config.httpRequestDispatcher(url, { method, body });
            }
        }

        return window.dataTarget.config.httpRequestDispatcher(url);
    }

    function getUrl(urlOrInvokerElement: URL | HTMLAnchorElement | HTMLFormElement) {
        if (urlOrInvokerElement instanceof HTMLAnchorElement) {
            return new URL(urlOrInvokerElement.href);
        }

        if (urlOrInvokerElement instanceof HTMLFormElement) {
            return new URL(urlOrInvokerElement.action);
        }

        return urlOrInvokerElement;
    }

    function dispatchGETRequestForForm(form: HTMLFormElement, formData: FormData) {
        const entries = Array.from(formData.entries());
        const entriesWithoutFiles = entries
            .map(([key, value]) => value instanceof File ? null : [key, value])
            .filter((pair): pair is [string, string] => !!pair);
        const queryString = new URLSearchParams(Object.fromEntries(entriesWithoutFiles));
        return window.dataTarget.config.httpRequestDispatcher(`${form.action}?${queryString}`);
    }
})();

type ElementLocator = {
    id: string;
}

type HTMLContainer = {
    html: string;
}
