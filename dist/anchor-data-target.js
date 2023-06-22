"use strict";
(() => {
    window.anchorDataTargetConfig = {
        urlTransformer: (url) => url,
        errorHandler: (error) => console.error(error),
        httpRequestDispatcher: async (url) => {
            const response = await fetch(url);
            return {
                content: await response.text(),
                statusCode: response.status
            };
        }
    };
    window.addEventListener('popstate', event => tryLoadContent(location.href, event.state.targetId));
    initialize(document.body);
    function initialize(root) {
        addClickListeners(root);
        let autoloadingAnchors = root.querySelectorAll('a[data-autoload][data-target]:not([data-target=""])');
        autoloadingAnchors.forEach((anchor) => anchor.click());
    }
    function addClickListeners(element) {
        const anchors = element.querySelectorAll('a[data-target]:not([data-target=""])');
        anchors.forEach((anchorElement) => {
            anchorElement.addEventListener('click', handleClick);
        });
        const elementsWithDefaultTargetId = element.querySelectorAll('[data-default-target]:not([data-default-target=""])');
        elementsWithDefaultTargetId.forEach((parentElement) => {
            const links = parentElement.querySelectorAll('a:not([data-target])');
            links.forEach((anchorElement) => {
                anchorElement.setAttribute('data-target', parentElement.getAttribute('data-default-target'));
                anchorElement.addEventListener('click', handleClick);
            });
        });
    }
    function handleClick(event) {
        event.preventDefault();
        const target = event.target;
        const targetElementSelector = target.getAttribute('data-target');
        history.pushState({ targetElementSelector }, "", target.href);
        tryLoadContent(target.href, targetElementSelector);
    }
    function tryLoadContent(url, targetElementSelector) {
        try {
            loadContent(url, targetElementSelector);
        }
        catch (error) {
            window.anchorDataTargetConfig.errorHandler(error);
        }
    }
    async function loadContent(url, targetElementSelector) {
        const targetElement = getTargetElement(url, targetElementSelector);
        const transformedUrl = window.anchorDataTargetConfig.urlTransformer(url);
        const response = await window.anchorDataTargetConfig.httpRequestDispatcher(transformedUrl);
        renderContentInsideTargetElement(targetElement, response.content);
        initialize(targetElement);
        const eventDetail = { url, targetElementSelector, responseStatusCode: response.statusCode };
        dispatchContentLoadedEvent(targetElement, eventDetail);
    }
    function getTargetElement(url, targetElementSelector) {
        const targetElement = document.querySelector(targetElementSelector);
        if (!targetElement)
            throw new Error(`No element found for selector "${targetElementSelector}" to render response from ${url}`);
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