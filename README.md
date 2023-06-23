# Anchor data-target

## Basic functionality

This library allows an HTML anchor tag to render the response of the request inside another element.

The element in which the response will be rendered inside must have it's `id` attribute indicated in the `data-target` attribute of the corresponding anchor.

Example:

``` HTML
<a href="/some-address" data-target="the-target-element-id">Click me!</a>
<div id="the-target-element-id">
    The content of this div will be replaced by the response of the HTTP request
</div>
```

By default, the browser's URL will not be changed if the anchor has the `data-target` attribute.