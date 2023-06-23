"use strict";
(() => {
    window.anchorDataTargetConfig = {
        errorHandler: (error, anchor) => {
            console.error({ error, anchor });
        },
        httpRequestDispatcher: async (anchor) => {
            const response = await fetch(anchor.href);
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
        tryLoadContent(target);
    }
    function tryLoadContent(anchor) {
        try {
            loadContent(anchor);
        }
        catch (error) {
            window.anchorDataTargetConfig.errorHandler(error, anchor);
        }
    }
    async function loadContent(anchor) {
        const targetElementId = anchor.getAttribute('data-target');
        const targetElement = getTargetElement(targetElementId);
        const response = await window.anchorDataTargetConfig.httpRequestDispatcher(anchor);
        renderContentInsideTargetElement(targetElement, response.content);
        addClickListeners(targetElement);
        dispatchContentLoadedEvent(targetElement, {
            url: anchor.href,
            targetElementId,
            responseStatusCode: response.statusCode
        });
    }
    function getTargetElement(targetElementId) {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement)
            throw new Error(`Anchor data-target: No element found with ID "${targetElementId}"`);
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