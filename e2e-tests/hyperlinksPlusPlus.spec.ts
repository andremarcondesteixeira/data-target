import test from './customFixtures';

test.describe('basic functionality', () => {
    test('an anchor with a "data-target" attribute puts the response of the http request in the first', async ({
        withPageContent
    }) => {
        const html = /*html*/ `
            <a id="hyperlink"
               href="/pages/basic.html"
               data-target="#target-element-id">click me!</a>
            <div id="target-element-id"></div>
        `;

        await withPageContent(html)
            .click('#hyperlink')
            .then().expectThat().element('#target-element-id').hasSameContentOf('pages/basic.html')
            .and().runTest();
    });

    test('an anchor with a data-target attribute works independently of the nesting level of the anchor', async ({
        withPageContent
    }) => {
        const html = /*html*/ `
            <header>
                <nav>
                    <section class="books">
                        <ul>
                            <li>
                                <a id="nested-anchor"
                                   href="/pages/requested-from-nested-anchor.html"
                                   data-target="#is-upper-in-the-dom-tree">Anchors should work no matter where they are in the DOM</a>
                            </li>
                        </ul>
                    </section>
                </nav>
            </header>
            <main id="is-upper-in-the-dom-tree"></main>
        `;

        await withPageContent(html)
            .click('#nested-anchor')
            .then().expectThat().element('#is-upper-in-the-dom-tree').hasSameContentOf('pages/requested-from-nested-anchor.html')
            .and().runTest();
    });

    test('an anchor with a "data-autoload" attribute loads automatically', async ({
        withPageContent
    }) => {
        const html = /*html*/ `
            <a href="/pages/basic-automatic.html"
               data-target="#will-get-content-automatically"
               data-autoload>This anchor will dispatch the request automatically after initial page load</a>
            <div id="will-get-content-automatically"></div>
        `;

        await withPageContent(html)
            .expectThat().element('#will-get-content-automatically').hasSameContentOf('pages/basic-automatic.html')
            .and().runTest();
    });

    test(`an anchor with a "data-autoload" attribute loads automatically independently of the anchor's nesting level`, async ({
        withPageContent
    }) => {
        const html = /*html*/ `
            <header>
                <nav>
                    <section class="books">
                        <ul>
                            <li>
                                <a href="/pages/requested-from-nested-anchor.html"
                                   data-target="#is-upper-in-the-dom-tree"
                                   data-autoload>Autoload anchors should work no matter where they are in the DOM</a>
                            </li>
                        </ul>
                    </section>
                </nav>
            </header>
            <main id="is-upper-in-the-dom-tree"></main>
        `;

        await withPageContent(html)
            .expectThat().element('#is-upper-in-the-dom-tree').hasSameContentOf('pages/requested-from-nested-anchor.html')
            .and().runTest();
    });

    test('multiple autoload anchors can be defined simultaneously as long as they do not point to the same target', async ({
        withPageContent
    }) => {
        const html = /* html */ `
            <a href="/pages/basic.html"
               data-target="#content-1"
               data-autoload>Loads automatically inside #content-1</a>
            <a href="/pages/basic-automatic.html"
               data-target="#content-2"
               data-autoload>Loads automatically inside #content-2</a>
            <div id="content-1"></div>
            <div id="content-2"></div>
        `;

        await withPageContent(html)
            .expectThat().element('#content-1').hasSameContentOf('pages/basic.html')
            .and().expectThat().element('#content-2').hasSameContentOf('pages/basic-automatic.html')
            .and().runTest();
    });

    test('an hlpp:load event is fired after the target element has received content', async ({
        withPageContent
    }) => {
        const html = /*html*/ `
            <a id="hyperlink"
               href="/pages/basic.html"
               data-target="#target-element-id">click me!</a>
            <div id="target-element-id"></div>
        `;

        await withPageContent(html)
            .click('#hyperlink')
            .then().expectThat().loadEvent().hasBeenDispatchedWithDetails({
                url: `${process.env['BASE_URL']}/pages/basic.html`,
                targetElementSelector: '#target-element-id',
                responseStatusCode: 200,
            })
            .and().runTest();
    });

    test(`the browser's url will be updated upon navigation according to the anchor's link`, async ({
        withPageContent
    }) => {
        const html = /*html*/ `
            <a id="hyperlink"
               href="/pages/basic.html"
               data-target="#target-element-id">click me!</a>
            <div id="target-element-id"></div>
        `;

        await withPageContent(html)
            .click('#hyperlink')
            .then().expectThat().browserURLEndsWith('/pages/basic.html')
            .and().runTest();
    });
});
