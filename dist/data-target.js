"use strict";
(() => {
    window.dataTargetConfig = {
        errorHandler: (error, element) => {
            console.error({ error, element });
        },
        httpRequestDispatcher: async (element) => {
            if (element instanceof HTMLAnchorElement) {
                return dispatchRequestForAnchor(element);
            }
            return dispatchRequestForForm(element);
            async function dispatchRequestForAnchor(anchor) {
                const response = await fetch(anchor.href);
                return {
                    content: await response.text(),
                    statusCode: response.status
                };
            }
            async function dispatchRequestForForm(form) {
                const method = form.method;
                const formData = new FormData(form);
                let response;
                if (method.toLowerCase() === 'get') {
                    response = await dispatchGETRequestForForm(form);
                }
                else {
                    response = await fetch(form.action, { method, body: formData });
                }
                return {
                    content: await response.text(),
                    statusCode: response.status
                };
            }
            async function dispatchGETRequestForForm(form) {
                const formData = new FormData(form);
                const entries = formData.entries();
                const entriesArray = Array.from(entries);
                const entriesArrayWithoutFiles = entriesArray.map(([key, value]) => {
                    if (value instanceof File) {
                        return null;
                    }
                    return [key, value];
                }).filter((pair) => !!pair);
                const entriesObject = Object.fromEntries(entriesArrayWithoutFiles);
                const queryString = new URLSearchParams(entriesObject);
                return fetch(`${form.action}?${queryString}`);
            }
        },
    };
    window.dataTargetInit = (root) => {
        addClickListeners(root);
        addSubmitListeners(root);
    };
    window.dataTargetInit(document.body);
    function addClickListeners(root) {
        const anchors = root.querySelectorAll('a[data-target]:not([data-target=""])');
        anchors.forEach((anchor) => {
            anchor.addEventListener('click', handleClick);
        });
    }
    function addSubmitListeners(root) {
        const forms = root.querySelectorAll('form[data-target]:not([data-target=""])');
        forms.forEach((form) => {
            form.addEventListener('submit', handleSubmit);
        });
    }
    function handleClick(event) {
        event.preventDefault();
        const target = event.currentTarget;
        tryLoadContent(target);
    }
    function handleSubmit(event) {
        event.preventDefault();
        const target = event.currentTarget;
        tryLoadContent(target);
    }
    function tryLoadContent(element) {
        try {
            loadContent(element);
        }
        catch (error) {
            window.dataTargetConfig.errorHandler(error, element);
        }
    }
    async function loadContent(element) {
        const targetElementId = element.getAttribute('data-target');
        const targetElement = getTargetElement(targetElementId);
        const response = await window.dataTargetConfig.httpRequestDispatcher(element);
        renderContentInsideTargetElement(targetElement, response.content);
        window.dataTargetInit(targetElement);
        const url = element instanceof HTMLAnchorElement ? element.href : element.action;
        dispatchContentLoadedEvent(targetElement, {
            url,
            targetElementId,
            responseStatusCode: response.statusCode
        });
    }
    function getTargetElement(targetElementId) {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement)
            throw new Error(`data-target: No element found with ID "${targetElementId}"`);
        return targetElement;
    }
    function renderContentInsideTargetElement(targetElement, html) {
        while (targetElement.lastChild)
            targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }
    function dispatchContentLoadedEvent(targetElement, detail) {
        targetElement.dispatchEvent(new CustomEvent('data-target:load', {
            bubbles: true,
            cancelable: true,
            detail
        }));
    }
})();
//# sourceMappingURL=data-target.js.map