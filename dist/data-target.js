"use strict";
(() => {
    window.dataTarget = {
        config: {
            errorHandler: (error, urlOrInvokerElement) => console.error({ error, urlOrInvokerElement }),
            httpRequestDispatcher: async (input, init) => {
                const response = await fetch(input, init);
                return {
                    content: await response.text(),
                    statusCode: response.status,
                };
            },
            loadingIndicator: () => {
                const span = document.createElement('span');
                span.innerText = 'loading';
                return span;
            }
        },
        request: async (urlOrInvokerElement, targetElementId) => {
            try {
                if (typeof urlOrInvokerElement !== 'string'
                    && !(urlOrInvokerElement instanceof URL)
                    && !(urlOrInvokerElement instanceof HTMLAnchorElement)
                    && !(urlOrInvokerElement instanceof HTMLFormElement)) {
                    throw new Error('The first parameter of the request function must be of one of the following types: string, URL, HTMLAnchorElement, HTMLFormElement');
                }
                if (typeof urlOrInvokerElement === 'string' || urlOrInvokerElement instanceof URL) {
                    if (!targetElementId) {
                        throw new Error('When passing a URL object or a string in the first parameter of the request function, a second parameter containing the target element id is mandatory, but it was not provided');
                    }
                    return request(urlOrInvokerElement, {
                        id: targetElementId,
                    });
                }
                if (!urlOrInvokerElement.hasAttribute('data-target')) {
                    if (!targetElementId) {
                        throw new Error('When an element without the data-target property is passed in the first parameter of the request function, a second parameter containing the target element id is mandatory, but it was not provided');
                    }
                    return request(urlOrInvokerElement, {
                        id: targetElementId,
                    });
                }
                if (urlOrInvokerElement instanceof HTMLAnchorElement) {
                    return request(urlOrInvokerElement, {
                        id: urlOrInvokerElement.href,
                    });
                }
                return request(urlOrInvokerElement, {
                    id: urlOrInvokerElement.action,
                });
            }
            catch (error) {
                window.dataTarget.config.errorHandler(error, urlOrInvokerElement);
            }
        },
        attach: root => attach(root),
    };
    attach(document.body);
    function attach(root) {
        root.querySelectorAll('a[data-target]:not([data-target=""])')
            .forEach(anchor => anchor.addEventListener('click', event => {
            event.preventDefault();
            request(anchor, { id: anchor.getAttribute('data-target') });
        }));
        root.querySelectorAll('form[data-target]:not([data-target=""])')
            .forEach(form => form.addEventListener('submit', event => {
            event.preventDefault();
            request(form, { id: form.getAttribute('data-target') });
        }));
    }
    async function request(urlOrInvokerElement, elementLocator) {
        try {
            if (typeof urlOrInvokerElement === 'string') {
                urlOrInvokerElement = new URL(urlOrInvokerElement);
            }
            await loadContent(urlOrInvokerElement, elementLocator);
        }
        catch (error) {
            window.dataTarget.config.errorHandler(error, urlOrInvokerElement);
        }
    }
    async function loadContent(urlOrInvokerElement, elementLocator) {
        const targetElement = getTargetElement(elementLocator);
        const loadingStringOrElement = window.dataTarget.config.loadingIndicator();
        const loading = loadingStringOrElement instanceof HTMLElement ?
            loadingStringOrElement.outerHTML :
            loadingStringOrElement;
        renderContentInsideTargetElement(targetElement, {
            html: loading
        });
        const { response, url } = await dispatchRequest(urlOrInvokerElement);
        renderContentInsideTargetElement(targetElement, {
            html: response.content
        });
        attach(targetElement);
        targetElement.dispatchEvent(new CustomEvent('data-target:load', {
            bubbles: true,
            cancelable: true,
            detail: {
                url: url.href,
                targetElementId: elementLocator.id,
                responseStatusCode: response.statusCode
            }
        }));
    }
    function getTargetElement(elementLocator) {
        const targetElement = document.getElementById(elementLocator.id);
        if (targetElement === null) {
            throw new Error(`data-target: No target element found with ID "${elementLocator.id}"`);
        }
        return targetElement;
    }
    function renderContentInsideTargetElement(targetElement, htmlContainer) {
        while (targetElement.lastChild) {
            targetElement.removeChild(targetElement.lastChild);
        }
        targetElement.insertAdjacentHTML('afterbegin', htmlContainer.html);
    }
    async function dispatchRequest(urlOrInvokerElement) {
        let url;
        let response;
        if (urlOrInvokerElement instanceof HTMLAnchorElement) {
            url = new URL(urlOrInvokerElement.href);
            response = await window.dataTarget.config.httpRequestDispatcher(url);
        }
        else if (urlOrInvokerElement instanceof HTMLFormElement) {
            url = new URL(urlOrInvokerElement.action);
            const method = urlOrInvokerElement.method;
            const body = new FormData(urlOrInvokerElement);
            if (method.toLowerCase() === 'get') {
                response = await dispatchGETRequestForForm(urlOrInvokerElement, body);
            }
            else {
                response = await window.dataTarget.config.httpRequestDispatcher(url, { method, body });
            }
        }
        else {
            url = new URL(urlOrInvokerElement.href);
            response = await window.dataTarget.config.httpRequestDispatcher(url);
        }
        return {
            url,
            response
        };
    }
    function dispatchGETRequestForForm(form, formData) {
        const entries = Array.from(formData.entries());
        const entriesWithoutFiles = entries
            .map(([key, value]) => value instanceof File ? null : [key, value])
            .filter((pair) => !!pair);
        const queryString = new URLSearchParams(Object.fromEntries(entriesWithoutFiles));
        return window.dataTarget.config.httpRequestDispatcher(`${form.action}?${queryString}`);
    }
})();
//# sourceMappingURL=data-target.js.map