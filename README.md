# data-target

## Basic functionality

This library allows HTML anchors and forms to render the response of the request inside another element.

The element in which the response will be rendered inside must have it's `id` attribute's value replicated in the `data-target` attribute of the corresponding anchor or form.

After the response is rendered inside the target element, the library will look for more `data-target` attributes inside the inner HTML of the target element.

By default, the browser's URL will not be changed after rendering the response inside the target element, but this behavior can be changed. Look at the "Configuration" section below for more information.

Please note that if the rendered response contains javascript code, this code will not be executed by the browser. If you want to execute javascript code according to the rendered response, you could listen to the "data-target:load" event to create your logic to load your modules. To see an example see the "Events" section.

## Example using an anchor:

``` HTML
<a href="/path" data-target="the-target-element-id">Click me!</a>
<div id="the-target-element-id">
    The content of this div will be replaced by the response of the HTTP request
</div>
```

## Example using a form:

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

After a response is rendered inside the target element, a "data-target:load" event will be dispatched with the following format:

``` Typescript
{
    detail: {
        url: string;
        targetElementId: string;
        responseStatusCode: number;
    }
}
```

### Example

``` Javascript
window.addEventListener('data-target:load', (event) => {
    console.log(
        `loaded URL ${event.detail.url} inside element with `
        + `ID "${event.detail.targetElementId}, with response `
        + `status code ${event.detail.responseStatusCode}"`
    );
});
```

Another example is using this event to dynamically load some javascript modules according to which url was loaded:

``` Javascript
const modulesMap = {
    'http://localhost/foo': '/modules/foo.js',
    'http://localhost/bar': '/modules/bar.js',
    'http://localhost/baz': '/modules/baz.js',
    'http://localhost/qux': '/modules/qux.js'
};

window.addEventListener('data-target:load', async (event) => {
    const scriptPath = modulesMap[event.detail.url];
    if (scriptPath) {
        await import(scriptPath);
    }
});
```

## Configuration

This library exposes a global object inside `window` called `dataTarget`, which you can use to configure the library's behavior and invoke the library programmatically:

``` Typescript
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
        loadingIndicator: () => string | HTMLElement;
    };
    request: (
        urlOrInvokerElement: string | URL | HTMLAnchorElement | HTMLFormElement,
        targetElementId: string
    ) => Promise<void>;
    attach: (root: HTMLElement) => void;
};

declare global {
    interface Window {
        dataTarget: DataTargetDefinitions;
    }
}
```

### `window.dataTarget.config.errorHandler`

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

### `window.dataTarget.config.httpRequestDispatcher`

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

### `window.dataTarget.config.loadingIndicator`

The library calls the function to display a loading feedback to the end user.

You can reimplement it to personalize your loading feedback.

## Using the library programmatically

### `window.dataTarget.request`

This function allows you to programmatically invoke the request.

Behind the scenes, it will also use the `httpRequestDispatcher` and the `loadingIndicator` functions.

Avoid overriding this function, as it could break the library's funcionality.

### `window.dataTarget.attach`

This function allows you to programmatically attach the library's event listeners:

- `onClick` event listeners to anchor containing a non-empty data-target attribute
- `onSubmit` event listeners to forms containing a non-empty data-target attribute