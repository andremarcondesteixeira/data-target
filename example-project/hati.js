export default function hati(root, config) {
    const router = typeof config?.router === 'function'
        ? config.router
        : (url => url);

    const errorHandler = typeof config?.errorHandler === 'function'
        ? config.errorHandler
        : (error => console.error(error));

    const contentRetriever = typeof config?.contentRetriever === 'function'
        ? config.contentRetriever
        : (
            async href => {
                let response = await fetch(href);
                const content = await response.text();
                return {
                    content,
                    statusCode: response.status
                };
            }
        );

    window.onpopstate = event => tryLoadContent(location.href, event.state.targetId);
    addClickListeners();

    root.querySelector('a[data-init]')?.click();

    function addClickListeners() {
        root.querySelectorAll('a[data-target-id]:not([data-target-id=""])')
            .forEach(a => a.addEventListener('click', handleClick));

        root.querySelectorAll('[data-anchors-target-id]:not([data-anchors-target-id=""])')
            .forEach(node => {
                node.querySelectorAll('a:not([data-target-id])')
                    .forEach(a => {
                        const dataAnchorsTargetId = node.getAttribute('data-anchors-target-id');
                        a.setAttribute('data-target-id', dataAnchorsTargetId);
                        a.addEventListener('click', handleClick);
                    });
            });
    }

    function handleClick(event) {
        event.preventDefault();
        const targetId = event.target.getAttribute('data-target-id');
        history.pushState({ targetId }, null, event.target.href);
        tryLoadContent(event.target.href, targetId);
    }

    async function tryLoadContent(url, targetId) {
        const targetElement = root.querySelector(`#${targetId}`);
        !!targetElement
            ? loadContent(url, targetElement)
            : errorHandler(new Error(`No element found with id: "${targetId}"`));
    }

    async function loadContent(url, targetElement) {
        try {
            const response = await contentRetriever(router(url));
            renderContentInsideTargetElement(targetElement, response.content);
            addClickListeners(targetElement);
            dispatchContentLoadedEvent(targetElement, {
                url,
                responseStatusCode: response.statusCode
            });
        } catch (error) {
            errorHandler(error);
        }
    }

    function renderContentInsideTargetElement(targetElement, html) {
        while (targetElement.lastChild)
            targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }

    function dispatchContentLoadedEvent(targetElement, detail) {
        const event = new CustomEvent('hati:DOMContentLoaded', {
            bubbles: true,
            cancelable: true,
            detail: {
                ...detail,
                matchUrl: (regex, callback) => {
                    if (regex.test(detail.href))
                        callback();
                }
            }
        });
        targetElement.dispatchEvent(event);
    }
}
