/// <reference path="anchor-data-target.d.ts" />
(() => {
    window.anchorDataTargetConfig = {
        errorHandler: (error: unknown) => console.error(error),
        httpRequestDispatcher: async (url: string) => {
            const response = await fetch(url);
            return {
                content: await response.text(),
                statusCode: response.status
            };
        }
    };

    addClickListeners(document.body);

    function addClickListeners(element: HTMLElement) {
        const anchors: NodeListOf<HTMLAnchorElement> = element.querySelectorAll('a[data-target]:not([data-target=""])');
        anchors.forEach((anchorElement: HTMLAnchorElement) => {
            anchorElement.addEventListener('click', handleClick);
        });
    }

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        const target = event.target as HTMLAnchorElement;
        const targetElementId = target.getAttribute('data-target') as string;
        tryLoadContent(target.href, targetElementId);
    }

    function tryLoadContent(url: string, targetElementId: string) {
        try {
            loadContent(url, targetElementId);
        } catch (error) {
            window.anchorDataTargetConfig.errorHandler(error);
        }
    }

    async function loadContent(url: string, targetElementId: string) {
        const targetElement = getTargetElement(url, targetElementId);
        const response = await window.anchorDataTargetConfig.httpRequestDispatcher(url);
        renderContentInsideTargetElement(targetElement, response.content);
        addClickListeners(targetElement);
        const eventDetail: ContentLoadedEventDetail = { url, targetElementId, responseStatusCode: response.statusCode };
        dispatchContentLoadedEvent(targetElement, eventDetail);
    }

    function getTargetElement(url: string, targetElementId: string) {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement)
            throw new Error(`No element found with ID "${targetElementId}" to render response from ${url}`);
        return targetElement as HTMLElement;
    }

    function renderContentInsideTargetElement(targetElement: HTMLElement, html: string) {
        while (targetElement.lastChild)
            targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }

    function dispatchContentLoadedEvent(targetElement: HTMLElement, detail: ContentLoadedEventDetail) {
        targetElement.dispatchEvent(new CustomEvent('anchor-data-target:load', {
            bubbles: true,
            cancelable: true,
            detail
        }));
    }
})();

type ContentLoadedEventDetail = {
    url: string;
    targetElementId: string;
    responseStatusCode: number;
}
