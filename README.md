This library adds a `data-target` attribute to the HTML's `<a>` element.

This new property allows you to point to another element which will receive the content referenced by the anchor's `href` attribute.

## Example

``` html
<a href="/some/page" data-target="content">some page</a>
<section id="content">
    <!-- CONTENT WILL BE PLACED HERE -->
</section>
```

The `data-target` attribute accepts a string that corresponds to the `id` of another element.

## Error handling

If no element is found with the `id` specified in `data-target` then the browser's console will show an error message: `no element found with id: ${the id}`
