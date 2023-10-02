import test from './customFixtures';

test.describe('basic functionality using anchors:', () => {
    test(`"data-target" indicates the ID of the target element that will receive the response`,
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <a id="hyperlink"
                    href="/pages/the_road_not_taken.html"
                    data-target="target">click me!</a>
                <div id="target"></div>
            `;

            await withPageContent(html)
                .click('#hyperlink')
                .then().expectThat().element('#target').hasSameContentOf('pages/the_road_not_taken.html')
                .and().runTest();
        }
    );

    test('a "data-target:loaded" event is fired after the target element has received content',
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <a id="hyperlink"
                   href="/pages/the_road_not_taken.html"
                   data-target="target">click me!</a>
                <div id="target"></div>
            `;

            await withPageContent(html)
                .click('#hyperlink')
                .then().expectThat().loadEvent().hasBeenDispatchedWithDetails({
                    url: `${process.env['BASE_URL']}/pages/the_road_not_taken.html`,
                    responseStatusCode: 200,
                })
                .and().runTest();
        }
    );
});

test.describe('basic functionality using forms with GET method:', () => {
    test(`"data-target" indicates the ID of the target element that will receive the response`,
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <form action="/pages/the_road_not_taken.html" method="get" data-target="target">
                    <button id="submit-button">Submit</button>
                </form>
                <div id="target"></div>
            `;

            await withPageContent(html)
                .click('#submit-button')
                .then().expectThat().element('#target').hasSameContentOf('pages/the_road_not_taken.html')
                .and().runTest();
        }
    );

    test('a "data-target:loaded" event is fired after the target element has received content',
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <form action="/pages/the_road_not_taken.html" method="get" data-target="target">
                    <button id="submit-button">Submit</button>
                </form>
                <div id="target"></div>
            `;

            await withPageContent(html)
                .click('#submit-button')
                .then().expectThat().loadEvent().hasBeenDispatchedWithDetails({
                    url: `${process.env['BASE_URL']}/pages/the_road_not_taken.html`,
                    responseStatusCode: 200,
                })
                .and().runTest();
        }
    );
});

test.describe('basic functionality using forms with POST method:', () => {
    test(`"data-target" indicates the ID of the target element that will receive the response`,
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <form action="/say-hello" method="post" data-target="target">
                    <button id="submit-button">Submit</button>
                </form>
                <div id="target"></div>
            `;

            await withPageContent(html)
                .click('#submit-button')
                .then().expectThat().element('#target').hasContent('hello')
                .and().runTest();
        }
    );

    test('a "data-target:loaded" event is fired after the target element has received content',
        async ({ withPageContent }) => {
            const html = /*html*/ `
                <form action="/say-hello" method="post" data-target="target">
                    <button id="submit-button">Submit</button>
                </form>
                <div id="target"></div>
            `;

            await withPageContent(html)
                .click('#submit-button')
                .then().expectThat().loadEvent().hasBeenDispatchedWithDetails({
                    url: `${process.env['BASE_URL']}/say-hello`,
                    responseStatusCode: 200,
                })
                .and().runTest();
        }
    );
});
