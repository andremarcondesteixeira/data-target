import test from './customFixtures';

test.describe('basic functionality', () => {
    test('clicking an anchor with a "data-target" attribute will put the response of the http request inside the element with a matching "id" attribute', async ({ withPageContent }) => {
        const html = /*html*/ `
            <a id="hyperlink" href="/pages/basic.html" data-target="target-element-id">click me!</a>
            <div id="target-element-id"></div>
        `;

        await withPageContent(html)
            .do(async page => await page.click('#hyperlink'))
            .expectedThatTarget('target-element-id')
            .receivedContentFromFile('pages/basic.html')
            .test();
    });

    test('clicking an anchor with a data-target attribute works independently of the nesting level of the anchor', async ({ withPageContent }) => {
        const html = /*html*/ `
            <header>
                <nav>
                    <section class="books">
                        <ul>
                            <li>
                                <a id="nested-anchor" href="/pages/requested-from-nested-anchor.html" data-target="is-upper-in-the-dom-tree">
                                    Anchors should work no matter where they are in the DOM
                                </a>
                            </li>
                        </ul>
                    </section>
                </nav>
            </header>
            <main id="is-upper-in-the-dom-tree"></main>
        `;

        await withPageContent(html)
            .do(async page => await page.click('#nested-anchor'))
            .expectedThatTarget('is-upper-in-the-dom-tree')
            .receivedContentFromFile('pages/requested-from-nested-anchor.html')
            .test();
    });

    test('an anchor with a "data-autoload" attribute loads automatically', async ({ withPageContent }) => {
        const html = /*html*/ `
            <a href="/pages/basic-automatic.html" data-target="will-get-content-automatically" data-autoload>
                This anchor will dispatch the request automatically after initial page load
            </a>
            <div id="will-get-content-automatically"></div>
        `;

        await withPageContent(html)
            .expectedThatTarget('will-get-content-automatically')
            .receivedContentFromFile('pages/basic-automatic.html')
            .test();
    });

    test('an anchor with a "data-autoload" attribute loads automatically independently of the nesting level of the anchor', async ({ withPageContent }) => {
        const html = /*html*/ `
            <header>
                <nav>
                    <section class="books">
                        <ul>
                            <li>
                                <a href="/pages/requested-from-nested-anchor.html" data-target="is-upper-in-the-dom-tree" data-autoload>
                                   Autoload anchors should work no matter where they are in the DOM
                                </a>
                            </li>
                        </ul>
                    </section>
                </nav>
            </header>
            <main id="is-upper-in-the-dom-tree"></main>
        `;

        await withPageContent(html)
            .expectedThatTarget('is-upper-in-the-dom-tree')
            .receivedContentFromFile('pages/requested-from-nested-anchor.html')
            .test();
    });

    test('Multiple autoload anchors can be defined simultaneously as long as they do not point to the same target', async ({ withPageContent }) => {
        const html = /* html */ `
            <a href="/pages/basic.html" data-target="content-1" data-autoload>Loads automatically inside #content-1</a>
            <a href="/pages/basic-automatic.html" data-target="content-2" data-autoload>Loads automatically inside #content-2</a>
            <div id="content-1"></div>
            <div id="content-2"></div>
        `;

        await withPageContent(html)
            .expectedThatTarget('content-1')
            .receivedContentFromFile('pages/basic.html')
            .test();

        await withPageContent(html)
            .expectedThatTarget('content-2')
            .receivedContentFromFile('pages/basic-automatic.html')
            .test();
    });
});
