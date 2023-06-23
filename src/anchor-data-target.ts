/// <reference path="anchor-data-target.d.ts" />
(() => {
    window.anchorDataTargetConfig = {
        errorHandler: (error: unknown, anchor: HTMLAnchorElement) => {
            console.error({ error, anchor });
        },
        httpRequestDispatcher: async (anchor: HTMLAnchorElement) => {
            const response = await fetch(anchor.href);
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
        tryLoadContent(target);
    }

    function tryLoadContent(anchor: HTMLAnchorElement) {
        try {
            loadContent(anchor);
        } catch (error) {
            window.anchorDataTargetConfig.errorHandler(error, anchor);
        }
    }

    async function loadContent(anchor: HTMLAnchorElement) {
        const targetElementId = anchor.getAttribute('data-target') as string;
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

    function getTargetElement(targetElementId: string) {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement)
            throw new Error(`Anchor data-target: No element found with ID "${targetElementId}"`);
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
