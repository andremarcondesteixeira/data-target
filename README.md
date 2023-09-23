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

This library exposes a global object inside `window`, called `dataTargetConfig`, that you can use to configure the library's behavior:

``` Typescript
export declare type DataTargetConfig = {
    errorHandler: (error: unknown, element: HTMLAnchorElement | HTMLFormElement) => void;
    httpRequestDispatcher: (element: HTMLAnchorElement | HTMLFormElement) => Promise<{
        content: string;
        statusCode: number;
    }>;
};

declare global {
    interface Window {
        dataTargetConfig: DataTargetConfig;
    }
}
```

### `errorHandler`

Use this function to personalize your error logs capturing logic.

This is the default implementation:

``` Typescript
errorHandler: (error: unknown, element: HTMLAnchorElement | HTMLFormElement) => {
    console.error({ error, element });
},
```

### `httpRequestDispatcher`

Reimplement this function if you need a more strict security control or any other requirement that may affect the http request dispatching logic, like changing the browser's url or using a different fetching library.

This is the default implementation:

``` Typescript
httpRequestDispatcher: async (element: HTMLAnchorElement | HTMLFormElement) => {
    if (element instanceof HTMLAnchorElement) {
        return dispatchRequestForAnchor(element);
    }
    
    return dispatchRequestForForm(element);

    async function dispatchRequestForAnchor(anchor: HTMLAnchorElement) {
        const response = await fetch(anchor.href);
        return {
            content: await response.text(),
            statusCode: response.status
        };
    }

    async function dispatchRequestForForm(form: HTMLFormElement) {
        const method = form.method;
        const formData = new FormData(form);
        let response: Response;

        if (method.toLowerCase() === 'get') {
            response = await dispatchGETRequestForForm(form);
        } else {
            response = await fetch(form.action, { method, body: formData });
        }

        return {
            content: await response.text(),
            statusCode: response.status
        };
    }

    async function dispatchGETRequestForForm(form: HTMLFormElement) {
        const formData = new FormData(form);
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
        return fetch(`${form.action}?${queryString}`);
    }
},
```
