import test from './customFixtures';

test.describe('basic functionality:', () => {
    test("the browser's url will be updated upon navigation according to the anchor's link",
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <a id="hyperlink"
                   href="/pages/the_road_not_taken.html"
                   data-target="#target-element-id">click me!</a>
                <div id="target-element-id"></div>
            `;

            await withPageContent(html)
                .click('#hyperlink')
                .then().expectThat().browserURLEndsWith('/pages/the_road_not_taken.html')
                .and().runTest();
        }
    );

    test('an anchor with a "data-target" attribute puts the response of the http request in '
        + "the first element matched by the selector in the attribute's value",
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <a id="hyperlink"
                   href="/pages/the_road_not_taken.html"
                   data-target=".target">click me!</a>
                <div id="first" class="target"></div>
                <div class="target"></div>
            `;

            await withPageContent(html)
                .click('#hyperlink')
                .then().expectThat().element('#first').hasSameContentOf('pages/the_road_not_taken.html')
                .and().expectThat().browserURLEndsWith("/pages/the_road_not_taken.html")
                .and().runTest();
        }
    );

    test('an anchor with a "data-target" attribute works independently of the nesting level of the anchor',
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <header>
                    <nav>
                        <section class="books">
                            <ul>
                                <li>
                                    <a id="nested-anchor"
                                       href="/pages/vida.html"
                                       data-target="#is-upper-in-the-dom-tree"
                                    >Anchors should work no matter where they are in the DOM</a>
                                </li>
                            </ul>
                        </section>
                    </nav>
                </header>
                <main id="is-upper-in-the-dom-tree"></main>
            `;

            await withPageContent(html)
                .click('#nested-anchor')
                .then().expectThat().element('#is-upper-in-the-dom-tree').hasSameContentOf('pages/vida.html')
                .and().expectThat().browserURLEndsWith("/pages/vida.html")
                .and().runTest();
        }
    );

    test('an "anchor-data-target:load" event is fired after the target element has received content',
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <a id="hyperlink"
                   href="/pages/the_road_not_taken.html"
                   data-target="#target-element-id">click me!</a>
                <div id="target-element-id"></div>
            `;

            await withPageContent(html)
                .click('#hyperlink')
                .then().expectThat().loadEvent().hasBeenDispatchedWithDetails({
                    url: `${process.env['BASE_URL']}/pages/the_road_not_taken.html`,
                    targetElementSelector: '#target-element-id',
                    responseStatusCode: 200,
                })
                .and().runTest();
        }
    );
});

test.describe('data-default-target attribute:', () => {
    test('a node with a "data-default-target" attribute sets the the "data-target" attribute of all descendant anchors',
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <header>
                    <nav data-default-target=".content">
                        <ul>
                            <li><a href="/pages/the_road_not_taken.html">click me!</a></li>
                            <li><a href="/pages/no_meio_do_caminho.html">click me!</a></li>
                            <li><a href="/pages/vida.html">click me!</a></li>
                        </ul>
                    </nav>
                </header>
                <main class="content"></main>
                <div id="target-element-id"></div>
            `;

            await withPageContent(html)
                .click('nav a:first-of-type')
                .then().expectThat().browserURLEndsWith('/pages/the_road_not_taken.html')
                .and().runTest();
        }
    );
});

test.describe('data-autoload attribute:', () => {
    test('an anchor with a "data-autoload" attribute loads automatically',
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <a href="/pages/no_meio_do_caminho.html"
                   data-target="#will-get-content-automatically"
                   data-autoload>This anchor will dispatch the request automatically after initial page load</a>
                <div id="will-get-content-automatically"></div>
            `;

            await withPageContent(html)
                .expectThat().element('#will-get-content-automatically').hasSameContentOf('pages/no_meio_do_caminho.html')
                .and().expectThat().browserURLEndsWith("/pages/no_meio_do_caminho.html")
                .and().runTest();
        }
    );

    test('an anchor with a "data-autoload" attribute can have its target defined by a parent element', async ({
        withPageContent
    }) => {
        const html = /*html*/ `
            <nav data-default-target="#will-get-content-automatically">
                <a href="/pages/no_meio_do_caminho.html"
                   data-autoload>This anchor will dispatch the request automatically after initial page load</a>
            </nav>
            <div id="will-get-content-automatically"></div>
        `;

        await withPageContent(html)
            .expectThat().element('#will-get-content-automatically').hasSameContentOf('pages/no_meio_do_caminho.html')
            .and().expectThat().browserURLEndsWith("/pages/no_meio_do_caminho.html")
            .and().runTest();
    });

    test(`an anchor with a "data-autoload" attribute loads automatically independently of the anchor's nesting level`,
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <header>
                    <nav>
                        <section class="books">
                            <ul>
                                <li>
                                    <a href="/pages/vida.html"
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
                .expectThat().element('#is-upper-in-the-dom-tree').hasSameContentOf('pages/vida.html')
                .and().expectThat().browserURLEndsWith("/pages/vida.html")
                .and().runTest();
        }
    );

    test('multiple autoload anchors can be defined simultaneously as long as they do not point to the same target',
        async ({ withPageContent }) => {
            const html = /* html */ `
                <a href="/pages/the_road_not_taken.html"
                   data-target="#content-1"
                   data-autoload>Loads automatically inside #content-1</a>
                <a href="/pages/no_meio_do_caminho.html"
                   data-target="#content-2"
                   data-autoload>Loads automatically inside #content-2</a>
                <div id="content-1"></div>
                <div id="content-2"></div>
            `;

            await withPageContent(html)
                .expectThat().element('#content-1').hasSameContentOf('pages/the_road_not_taken.html')
                .and().expectThat().element('#content-2').hasSameContentOf('pages/no_meio_do_caminho.html')
                .and().runTest();
        }
    );
});
