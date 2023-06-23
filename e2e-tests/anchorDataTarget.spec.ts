import test from './customFixtures';

test.describe('basic functionality:', () => {
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

    test('an "anchor-data-target:load" event is fired after the target element has received content',
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
                    targetElementId: 'target',
                    responseStatusCode: 200,
                })
                .and().runTest();
        }
    );
});
