"use strict";
(() => {
    window.anchorDataTargetConfig = {
        errorHandler: (error) => console.error(error),
        httpRequestDispatcher: async (url) => {
            const response = await fetch(url);
            return {
                content: await response.text(),
                statusCode: response.status
            };
        }
    };
    addClickListeners(document.body);
    function addClickListeners(element) {
        const anchors = element.querySelectorAll('a[data-target]:not([data-target=""])');
        anchors.forEach((anchorElement) => {
            anchorElement.addEventListener('click', handleClick);
        });
    }
    function handleClick(event) {
        event.preventDefault();
        const target = event.target;
        const targetElementId = target.getAttribute('data-target');
        tryLoadContent(target.href, targetElementId);
    }
    function tryLoadContent(url, targetElementId) {
        try {
            loadContent(url, targetElementId);
        }
        catch (error) {
            window.anchorDataTargetConfig.errorHandler(error);
        }
    }
    async function loadContent(url, targetElementId) {
        const targetElement = getTargetElement(url, targetElementId);
        const response = await window.anchorDataTargetConfig.httpRequestDispatcher(url);
        renderContentInsideTargetElement(targetElement, response.content);
        addClickListeners(targetElement);
        const eventDetail = { url, targetElementId, responseStatusCode: response.statusCode };
        dispatchContentLoadedEvent(targetElement, eventDetail);
    }
    function getTargetElement(url, targetElementId) {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement)
            throw new Error(`No element found with ID "${targetElementId}" to render response from ${url}`);
        return targetElement;
    }
    function renderContentInsideTargetElement(targetElement, html) {
        while (targetElement.lastChild)
            targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }
    function dispatchContentLoadedEvent(targetElement, detail) {
        targetElement.dispatchEvent(new CustomEvent('anchor-data-target:load', {
            bubbles: true,
            cancelable: true,
            detail
        }));
    }
})();
//# sourceMappingURL=anchor-data-target.js.map