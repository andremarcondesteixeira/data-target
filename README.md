# Mana Potion

This library adds a `data-target-id` attribute to the HTML's `<a>` element.

This new property allows you to point to another element which will receive the content referenced by the anchor's href attribute.

!["Hati" means "Heart" in indonesian](https://github.com/andremarcondesteixeira/hati/raw/main/heart.png)

## Example

``` html
<a href="/some/page" data-target-id="content">some page</a>
<section id="content">
    <!-- CONTENT WILL BE PLACED HERE -->
</section>
```

The `data-target-id` attribute accepts a string that corresponds to the `id` of another element.

## Error handling

If no element is found with the `id` specified in `data-target-id` then the browser's console will show an error message: `no element found with id: ${the id}`

## Note

This is a toy project. I don't advise to use it in production since there are far better ways to implement navigation. I use it in my blog, though :)
