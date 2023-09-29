/// <reference path="data-target.d.ts" />

type ElementLocator = {
    id: string;
}

type HTMLContainer = {
    html: string;
}

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
                if (typeof urlOrInvokerElement === 'string') {
                    urlOrInvokerElement = new URL(urlOrInvokerElement);
                }

                await loadContent(urlOrInvokerElement, {
                    id: targetElementId
                });
            } catch (error) {
                window.dataTarget.config.errorHandler(error, urlOrInvokerElement);
            }
        },
        attach: root => {
            root.querySelectorAll<HTMLAnchorElement>('a[data-target]:not([data-target=""])')
                .forEach(anchor => anchor.addEventListener('click', event => {
                    event.preventDefault();
                    window.dataTarget.request(anchor, anchor.getAttribute('data-target')!);
                }));

            root.querySelectorAll<HTMLFormElement>('form[data-target]:not([data-target=""])')
                .forEach(form => form.addEventListener('submit', event => {
                    event.preventDefault();
                    window.dataTarget.request(form, form.getAttribute('data-target')!);
                }));
        },
    };

    window.dataTarget.attach(document.body);

    async function loadContent(
        urlOrInvokerElement: URL | HTMLAnchorElement | HTMLFormElement,
        elementLocator: ElementLocator
    ) {
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
        window.dataTarget.attach(targetElement);

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

    function getTargetElement(elementLocator: ElementLocator) {
        const targetElement = document.getElementById(elementLocator.id);
        if (targetElement === null) throw new Error(`data-target: No target element found with ID "${elementLocator.id}"`);
        return targetElement;
    }

    function renderContentInsideTargetElement(targetElement: HTMLElement, htmlContainer: HTMLContainer) {
        while (targetElement.lastChild) targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', htmlContainer.html);
    }

    async function dispatchRequest(urlOrInvokerElement: URL | HTMLAnchorElement | HTMLFormElement) {
        let url: URL;
        let response: {
            content: string;
            statusCode: number;
        };

        if (urlOrInvokerElement instanceof HTMLAnchorElement) {
            url = new URL(urlOrInvokerElement.href);
            response = await window.dataTarget.config.httpRequestDispatcher(url);
        } else if (urlOrInvokerElement instanceof HTMLFormElement) {
            url = new URL(urlOrInvokerElement.action);
            const method = urlOrInvokerElement.method;
            const body = new FormData(urlOrInvokerElement);

            if (method.toLowerCase() === 'get') {
                response = await dispatchGETRequestForForm(urlOrInvokerElement, body);
            } else {
                response = await window.dataTarget.config.httpRequestDispatcher(url, { method, body });
            }
        } else {
            url = new URL(urlOrInvokerElement.href);
            response = await window.dataTarget.config.httpRequestDispatcher(url);
        }

        return {
            url,
            response
        };
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
