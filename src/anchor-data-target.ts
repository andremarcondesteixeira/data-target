/// <reference path="anchor-data-target.d.ts" />
(() => {
    window.anchorDataTargetConfig = {
        errorHandler: (error: unknown, element: HTMLAnchorElement | HTMLFormElement) => {
            console.error({ error, element });
        },
        httpRequestDispatcherForAnchors: async (anchor: HTMLAnchorElement) => {
            const response = await fetch(anchor.href);
            return {
                content: await response.text(),
                statusCode: response.status
            };
        },
        httpRequestDispatcherForForms: async (form: HTMLFormElement) => {
            const method = form.method;
            const formData = new FormData(form);
            let response: Response;

            if (method.toLowerCase() === 'get') {
                const entries = formData.entries();
                const entriesArray = Array.from(entries);
                const entriesArrayWithoutFiles = entriesArray.map(([key, value]) => {
                    if (value instanceof File) {
                        return null;
                    }

                    return [key, value];
                }).filter((pair): pair is [string, string] => !!pair);
                const entriesObject: Record<string, string> = Object.fromEntries(entriesArrayWithoutFiles);
                const queryString = new URLSearchParams(entriesObject);
                response = await fetch(`${form.action}?${queryString}`);
            } else {
                response = await fetch(form.action, { method, body: formData });
            }

            return {
                content: await response.text(),
                statusCode: response.status
            };
        }
    };

    addClickListeners(document.body);
    addSubmitListeners(document.body);

    function addClickListeners(root: HTMLElement) {
        const anchors: NodeListOf<HTMLAnchorElement> = root.querySelectorAll('a[data-target]:not([data-target=""])');
        anchors.forEach((anchor: HTMLAnchorElement) => {
            anchor.addEventListener('click', handleClick);
        });
    }

    function addSubmitListeners(root: HTMLElement) {
        const forms: NodeListOf<HTMLFormElement> = root.querySelectorAll('form[data-target]:not([data-target=""])');
        forms.forEach((form: HTMLFormElement) => {
            form.addEventListener('submit', handleSubmit);
        });
    }

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        const target = event.currentTarget as HTMLAnchorElement;
        tryLoadContent(target);
    }

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        const target = event.currentTarget as HTMLFormElement;
        tryLoadContent(target);
    }

    function tryLoadContent(element: HTMLAnchorElement | HTMLFormElement) {
        try {
            loadContent(element);
        } catch (error) {
            window.anchorDataTargetConfig.errorHandler(error, element);
        }
    }

    async function loadContent(element: HTMLAnchorElement | HTMLFormElement) {
        const targetElementId = element.getAttribute('data-target') as string;
        const targetElement = getTargetElement(targetElementId);
        const response = await (() => {
            if (element instanceof HTMLAnchorElement) {
                return window.anchorDataTargetConfig.httpRequestDispatcherForAnchors(element);
            }

            return window.anchorDataTargetConfig.httpRequestDispatcherForForms(element as HTMLFormElement);
        })();
        renderContentInsideTargetElement(targetElement, response.content);
        addClickListeners(targetElement);
        addSubmitListeners(targetElement);
        const url = element instanceof HTMLAnchorElement ? element.href : element.action;
        dispatchContentLoadedEvent(targetElement, {
            url,
            targetElementId,
            responseStatusCode: response.statusCode
        });
    }

    function getTargetElement(targetElementId: string) {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement)
            throw new Error(`data-target: No element found with ID "${targetElementId}"`);
        return targetElement as HTMLElement;
    }

    function renderContentInsideTargetElement(targetElement: HTMLElement, html: string) {
        while (targetElement.lastChild)
            targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }

    function dispatchContentLoadedEvent(targetElement: HTMLElement, detail: ContentLoadedEventDetail) {
        targetElement.dispatchEvent(new CustomEvent('data-target:load', {
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
