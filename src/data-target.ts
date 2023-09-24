/// <reference path="data-target.d.ts" />

(() => {
    window.dataTarget = {
        config: {
            errorHandler: (error, element) => console.error({ error, element }),
            httpRequestDispatcher: async (input, init) => {
                const response = await fetch(input, init);
                return {
                    content: await response.text(),
                    statusCode: response.status,
                };
            },
        },
        programmaticAccess: {
            _dispatchRequestAndRenderResponse: async (url, targetElementId) => {
                try {
                    const response = await window.dataTarget.config.httpRequestDispatcher(url);
                    const targetElement = getTargetElement(targetElementId);
                    renderContentInsideTargetElement(targetElement, response.content);
                } catch (error) {
                    window.dataTarget.config.errorHandler({ error, programmaticAccess: true });
                }
            },
            _makeDataTargetAttributesWork: root => {
                root.querySelectorAll<HTMLAnchorElement>('a[data-target]:not([data-target=""])')
                    .forEach(anchor => anchor.addEventListener('click', event => {
                        event.preventDefault();
                        const invokerAnchor = event.currentTarget as HTMLAnchorElement;
                        tryLoadContent(invokerAnchor);
                    }));

                root.querySelectorAll<HTMLFormElement>('form[data-target]:not([data-target=""])')
                    .forEach(form => form.addEventListener('submit', event => {
                        event.preventDefault();
                        const invokerForm = event.currentTarget as HTMLFormElement;
                        tryLoadContent(invokerForm);
                    }));
            },
        }
    };

    Object.freeze(window.dataTarget.programmaticAccess);

    window.dataTarget.programmaticAccess._makeDataTargetAttributesWork(document.body);

    function tryLoadContent(invokerElement: HTMLAnchorElement | HTMLFormElement) {
        try {
            loadContent(invokerElement);
        } catch (error) {
            window.dataTarget.config.errorHandler(error, invokerElement);
        }
    }

    async function loadContent(invokerElement: HTMLAnchorElement | HTMLFormElement) {
        const targetElementId = invokerElement.getAttribute('data-target') as string;
        const targetElement = getTargetElement(targetElementId);

        const response = await (async () => invokerElement instanceof HTMLAnchorElement ?
            window.dataTarget.config.httpRequestDispatcher(invokerElement.href)
            : dispatchRequestForForm(invokerElement)
        )();

        renderContentInsideTargetElement(targetElement, response.content);
        window.dataTarget.programmaticAccess._makeDataTargetAttributesWork(targetElement);

        const url = invokerElement instanceof HTMLAnchorElement ? invokerElement.href : invokerElement.action;
        targetElement.dispatchEvent(new CustomEvent('data-target:load', {
            bubbles: true,
            cancelable: true,
            detail: { url, targetElementId, responseStatusCode: response.statusCode }
        }));
    }

    function getTargetElement(targetElementId: string) {
        const targetElement = document.getElementById(targetElementId);
        if (targetElement === null) throw new Error(`data-target: No target element found with ID "${targetElementId}"`);
        return targetElement;
    }

    async function dispatchRequestForForm(form: HTMLFormElement) {
        const method = form.method;
        const body = new FormData(form);

        return method.toLowerCase() === 'get' ?
            dispatchGETRequestForForm(form, body)
            : window.dataTarget.config.httpRequestDispatcher(form.action, { method, body });
    }

    async function dispatchGETRequestForForm(form: HTMLFormElement, formData: FormData) {
        const entries = Array.from(formData.entries());
        const entriesWithoutFiles = entries
            .map(([key, value]) => value instanceof File ? null : [key, value])
            .filter((pair): pair is [string, string] => !!pair);
        const queryString = new URLSearchParams(Object.fromEntries(entriesWithoutFiles));
        return window.dataTarget.config.httpRequestDispatcher(`${form.action}?${queryString}`);
    }

    function renderContentInsideTargetElement(targetElement: HTMLElement, html: string) {
        while (targetElement.lastChild) targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }
})();
