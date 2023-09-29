/// <reference path="data-target.d.ts" />

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
                await loadContent(urlOrInvokerElement, targetElementId);
            } catch (error) {
                window.dataTarget.config.errorHandler(error, urlOrInvokerElement);
            }
        },
        attach: root => {
            root.querySelectorAll<HTMLAnchorElement>('a[data-target]:not([data-target=""])')
                .forEach(anchor => anchor.addEventListener('click', event => {
                    event.preventDefault();
                    const invokerAnchor = event.currentTarget as HTMLAnchorElement;
                    window.dataTarget.request(invokerAnchor, invokerAnchor.href);
                }));

            root.querySelectorAll<HTMLFormElement>('form[data-target]:not([data-target=""])')
                .forEach(form => form.addEventListener('submit', event => {
                    event.preventDefault();
                    const invokerForm = event.currentTarget as HTMLFormElement;
                    window.dataTarget.request(invokerForm, invokerForm.action);
                }));
        },
    };

    window.dataTarget.attach(document.body);

    async function loadContent(urlOrInvokerElement: string | HTMLAnchorElement | HTMLFormElement, targetElementId: string) {
        const targetElement = getTargetElement(targetElementId);

        const loadingStringOrElement = window.dataTarget.config.loadingIndicator();
        const loading = loadingStringOrElement instanceof HTMLElement ?
            loadingStringOrElement.outerHTML :
            loadingStringOrElement;
        renderContentInsideTargetElement(targetElement, loading);

        const { response, url } = await dispatchRequest(urlOrInvokerElement);

        renderContentInsideTargetElement(targetElement, response.content);
        window.dataTarget.attach(targetElement);

        targetElement.dispatchEvent(new CustomEvent('data-target:load', {
            bubbles: true,
            cancelable: true,
            detail: {
                url,
                targetElementId,
                responseStatusCode: response.statusCode
            }
        }));
    }

    function getTargetElement(targetElementId: string) {
        const targetElement = document.getElementById(targetElementId);
        if (targetElement === null) throw new Error(`data-target: No target element found with ID "${targetElementId}"`);
        return targetElement;
    }

    function renderContentInsideTargetElement(targetElement: HTMLElement, html: string) {
        while (targetElement.lastChild) targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }

    async function dispatchRequest(urlOrInvokerElement: string | HTMLAnchorElement | HTMLFormElement) {
        let url: string;
        let response: {
            content: string;
            statusCode: number;
        };

        if (urlOrInvokerElement instanceof HTMLAnchorElement) {
            url = urlOrInvokerElement.href;
            response = await window.dataTarget.config.httpRequestDispatcher(url);
        } else if (urlOrInvokerElement instanceof HTMLFormElement) {
            url = urlOrInvokerElement.action;
            const method = urlOrInvokerElement.method;
            const body = new FormData(urlOrInvokerElement);

            if (method.toLowerCase() === 'get') {
                response = await dispatchGETRequestForForm(urlOrInvokerElement, body);
            } else {
                response = await window.dataTarget.config.httpRequestDispatcher(url, { method, body });
            }
        } else {
            url = urlOrInvokerElement;
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
