# data-target

## Basic functionality

This library allows HTML anchors and forms to render the response of the request inside another element.

The element in which the response will be rendered inside must have it's `id` attribute's value replicated in the `data-target` attribute of the corresponding anchor or form.

After the response is rendered inside the target element, the library will look for more `data-target` attributes inside the inner HTML of the target element.

By default, the browser's URL will not be changed after rendering the response inside the target element, but this behavior can be changed. Look at the "Configuration" section below for more information.

Please note that if the rendered response contains javascript code, this code will not be executed by the browser. If you want to execute javascript code according to the rendered response, you could listen to the `data-target:loaded` event to create your logic to load your modules. To see an example see the "Events" section below.

### Example using an anchor:

``` HTML
<a href="/path" data-target="the-target-element-id">Click me!</a>
<div id="the-target-element-id">
    The content of this div will be replaced by the response of the HTTP request
</div>
```

### Example using a form:

``` HTML
<form action="/path" method="post" data-target="the-target-element-id">
    <input type="text" name="name" />
    <button>Submit</button>
</form>
<div id="the-target-element-id">
    The content of this div will be replaced by the response of the HTTP request
</div>
```

## Events

### `data-target:before-load`

This a `CustomEvent` that is dispatched by the target element before the library sends an HTTP request.

``` javascript
targetElement.dispatchEvent(new CustomEvent('data-target:before-request', {
    bubbles: true,
    detail: {
        url: url.href,
    },
}));
```

You can get a reference of the target element by using the `target` property of the event.

### `data-target:loaded`

This is a `CustomEvent` dispatched by the target element after it received the response of the HTTP request.

``` javascript
targetElement.dispatchEvent(new CustomEvent('data-target:loaded', {
    bubbles: true,
    detail: {
        url: url.href,
        responseStatusCode: response.statusCode
    }
}));
```

You can access the element which received the response through the `target` property of the event.

### Example of using the events

You can, for example, use the events to show loading indicators and dynamically execute some functions from javascript modules:

``` HTML
<script type="module">
    window.addEventListener('DOMContentLoaded', () => {
        const modulesMap = {
            [`${location.origin}/test`]: '/modules/test.js',
        };

        window.addEventListener('data-target:before-load', async (event) => {
            showLoadingIndicator(event.target);
            const scriptPath = modulesMap[event.detail.url];
            if (scriptPath) {
                const exportedMembers = await import(scriptPath);
                if (exportedMembers.onBeforeLoad) {
                    exportedMembers.onBeforeLoad(event);
                }
            }
        });

        window.addEventListener('data-target:loaded', async (event) => {
            const scriptPath = modulesMap[event.detail.url];
            if (scriptPath) {
                const exportedMembers = await import(scriptPath);
                if (exportedMembers.onLoaded) {
                    exportedMembers.onLoaded(event);
                }
            }
        });
    });
</script>
```

## Configuration and programmatic access

This library exposes a global object inside the `window` object called `dataTarget`, which you can use to configure the library's behavior and invoke the library programmatically.

The configuration is made by overriding the default implementations of the functions in `window.dataTarget.config` and the programmatic access is made through the `window.dataTarget.$` object, which is freezed and cannot be changed.

``` Typescript
// Typescript
export declare type DataTargetDefinitions = {
    config: {
        errorHandler: (
            error: unknown,
            urlOrInvokerElement?: string | URL | HTMLAnchorElement | HTMLFormElement
        ) => void;
        httpRequestDispatcher: (
            input: RequestInfo | URL,
            init?: RequestInit | undefined
        ) => Promise<{
            content: string;
            statusCode: number;
        }>;
    };
    $: {
        request: (
            urlOrInvokerElement: string | URL | HTMLAnchorElement | HTMLFormElement,
            targetElementId?: string,
            init?: RequestInit
        ) => Promise<void>;
        attach: (root: HTMLElement) => void;
    }
};

declare global {
    interface Window {
        dataTarget: DataTargetDefinitions;
    }
}
```

### Configuration

#### `window.dataTarget.config.errorHandler`

The library calls this function whenever an error occurs.

Use this function to personalize your error logs capturing logic.

This is the default implementation:

``` Typescript
{
    ...
    errorHandler: (error, urlOrInvokerElement) => console.error({ error, urlOrInvokerElement }),
    ...
}
```

#### `window.dataTarget.config.httpRequestDispatcher`

This function is used by the library do dispatch http requests.

You can reimplement this function if you need a more strict security control or any other requirement that may affect the http request dispatching logic, like changing the browser's url or using a different fetching library.

This is the default implementation:

``` Typescript
{
    ...
    httpRequestDispatcher: async (input, init) => {
        const response = await fetch(input, init);
        return {
            content: await response.text(),
            statusCode: response.status,
        };
    },
    ...
}
```

### Programmatic access

#### `window.dataTarget.$.request`

This function allows you to dispatch an HTTP request programmaticaly.

Behind the scenes, it will also use the `window.dataTarget.config.httpRequestDispatcher` function.

There are some rules you need to follow to use this function:

- If the first parameter is a string or a URL object, then you MUST pass the second parameter with the ID of the target element
- If the first parameter is a referente to an anchor or form, and the referenced element does not have a `data-target` attribute, you MUST provide the ID of the target element through the second parameter

#### `window.dataTarget.$.attach`

This function allows you to programmatically attach the library's event listeners:

- `onClick` event listeners to anchor containing a non-empty data-target attribute
- `onSubmit` event listeners to forms containing a non-empty data-target attribute
