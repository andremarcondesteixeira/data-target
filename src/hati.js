export default function hati(config) {
    const router = config?.router ?? (url => url);

    config
        .root
        .querySelectorAll('a[data-target-id]:not([data-target-id=""])')
        .forEach(a => a.addEventListener('click', handleClick));

    function handleClick(event) {
        dispatchBeforeLoadEvent(event.target);
        history.pushState({}, null, event.target.href);
        tryLoadContent(event);
    }

    function dispatchBeforeLoadEvent(anchor) {
        const event = new CustomEvent('hati:beforeLoad', {
            bubbles: true,
            cancelable: true,
            detail: {
                href: anchor.href
            }
        });
        anchor.dispatchEvent(event);
    }

    async function tryLoadContent(event) {
        event.preventDefault();
        const targetElement = getTargetElement(event.target);
        !!targetElement
            ? doLoadContent(event.target, targetElement)
            : handleError(event.target);
    }

    function getTargetElement(anchor) {
        const targetElementId = anchor.getAttribute('data-target-id');
        const targetElement = config.root.querySelector(`#${targetElementId}`);
        return targetElement;
    }

    async function doLoadContent(anchor, targetElement) {
        const url = router(anchor.href);
        const response = await fetchContent(url);
        renderContentInTargetElement(targetElement, response.content);
        hati({ ...config, root: targetElement });
        dispatchContentLoadedEvent(targetElement, {
            href: anchor.href,
            responseStatusCode: response.statusCode
        });
    }

    async function fetchContent(href) {
        let response = await fetch(href);
        const content = await response.text();
        return {
            content,
            statusCode: response.status
        };
    }

    function renderContentInTargetElement(targetElement, html) {
        while (targetElement.lastChild)
            targetElement.removeChild(targetElement.lastChild);
        targetElement.insertAdjacentHTML('afterbegin', html);
    }

    function dispatchContentLoadedEvent(targetElement, detail) {
        const event = new CustomEvent('hati:DOMContentLoaded', {
            bubbles: true,
            cancelable: true,
            detail
        });
        targetElement.dispatchEvent(event);
    }

    function handleError(anchor) {
        const errorMessage = `No element found with id: ${anchor.getAttribute('data-target-id')}`;
        const event = new CustomEvent('hati:error', {
            bubbles: true,
            cancelable: true,
            detail: {
                href: anchor.href,
                errorMessage
            }
        });
        anchor.dispatchEvent(event);
        console.error(errorMessage);
    }
}
