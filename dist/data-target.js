"use strict";
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
            loadingMessageElement: () => {
                const span = document.createElement('span');
                span.innerText = 'loading';
                return span;
            }
        },
        programmaticAccess: {
            _dispatchRequestAndRenderResponse: async (url, targetElementId) => {
                try {
                    const response = await window.dataTarget.config.httpRequestDispatcher(url);
                    const targetElement = getTargetElement(targetElementId);
                    renderContentInsideTargetElement(targetElement, response.content);
                }
                catch (error) {
                    window.dataTarget.config.errorHandler({ error, programmaticAccess: true });
                }
            },
            _makeDataTargetAttributesWork: root => {
                root.querySelectorAll('a[data-target]:not([data-target=""])')
                    .forEach(anchor => anchor.addEventListener('click', event => {
                    event.preventDefault();
                    const invokerAnchor = event.currentTarget;
                    tryLoadContent(invokerAnchor);
                }));
                root.querySelectorAll('form[data-target]:not([data-target=""])')
                    .forEach(form => form.addEventListener('submit', event => {
                    event.preventDefault();
                    const invokerForm = event.currentTarget;
                    tryLoadContent(invokerForm);
                }));
            },
        }
    };
    Object.freeze(window.dataTarget.programmaticAccess);
    window.dataTarget.programmaticAccess._makeDataTargetAttributesWork(document.body);
    function tryLoadContent(invokerElement) {
        try {
            loadContent(invokerElement);
        }
        catch (error) {
            window.dataTarget.config.errorHandler(error, invokerElement);
        }
    }
    async function loadContent(invokerElement) {
        const targetElementId = invokerElement.getAttribute('data-target');
        const targetElement = getTargetElement(targetElementId);
        renderContentInsideTargetElement(targetElement, window.dataTarget.config.loadingMessageElement().outerHTML);
        const response = await (async () => invokerElement instanceof HTMLAnchorElement ?
            window.dataTarget.config.httpRequestDispatcher(invokerElement.href)
            : dispatchRequestForForm(invokerElement))();
        renderContentInsideTargetElement(targetElement, response.content);
        window.dataTarget.programmaticAccess._makeDataTargetAttributesWork(targetElement);
        const url = invokerElement instanceof HTMLAnchorElement ? invokerElement.href : invokerElement.action;
        targetElement.dispatchEvent(new CustomEvent('data-target:load', {
            bubbles: true,
            cancelable: true,
            detail: { url, targetElementId, responseStatusCode: response.statusCode }
        }));
    }
    function getTargetElement(targetElementId) {
        const targetElement = document.getElementById(targetElementId);
        if (targetElement === null)
            throw new Error(`data-target: No target element found with ID "${targetElementId}"`);
        return targetElement;
    }
    async function dispatchRequestForForm(form) {
        const method = form.method;
        const body = new FormData(form);
        return method.toLowerCase() === 'get' ?
            dispatchGETRequestForForm(form, body)
            : window.dataTarget.config.httpRequestDispatcher(form.action, { method, body });
    }
    async function dispatchGETRequestForForm(form, formData) {
        const entries = Array.from(formData.entries());
        const entriesWithoutFiles = entries
            .map(([key, value]) => value instanceof File ? null : [key, value])
            .filter((pair) => !!pair);
        const queryString = new URLSearchParams(Object.fromEntries(entriesWithoutFiles));
        return window.dataTarget.config.httpRequestDispatcher(`${form.action}?${queryString}`);
    }
    function renderContentInsideTargetElement(targetElement, html) {
        while (targetElement.lastChild)
            targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }
})();
//# sourceMappingURL=data-target.js.map