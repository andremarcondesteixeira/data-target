import { expect, Page, PlaywrightTestArgs, PlaywrightTestOptions, test } from '@playwright/test';

test.describe('basic functionality', () => {
    test('clicking an anchor with a data-target attribute will load the content inside the element whose id matches the attribute', prepare({
        pageContent: `
            <a id="link" href="content.html" data-target="content">click me!</a>
            <div id="content"></div>
        `,
        assertions: async page => {
            await page.click('#link');
            await at(page).assertTarget('content').hasInnerText('loaded content');
        }
    }));

    test('an anchor with a data-autoload atribute loads automatically', prepare({
        pageContent: `
            <a href="content.html" data-target="content" data-autoload>
                I will make the request by myself after the page is rendered, but just 1 time
            </a>
            <div id="content"></div>
        `,
        assertions: async page => {
            await at(page).assertTarget('content').hasInnerText('loaded content');
        }
    }));

    test('clicking an anchor with a data-target attribute works independently of the nesting level of the anchor', prepare({
        pageContent: `
            <header>
                <nav>
                    <section class="books">
                        <ul>
                            <li>
                                <a id="nested-anchor" href="content.html" data-target="main-content">
                                    Anchors should work irrespective of where they are in the DOM
                                </a>
                            </li>
                        </ul>
                    </section>
                </nav>
            </header>
            <main id="main-content"></main>
        `,
        assertions: async page => {
            await page.click('#nested-anchor');
            await at(page).assertTarget('main-content').hasInnerText('loaded content');
        }
    }));
});

function prepare(config: TestConfig): (args: PlaywrightTestArgs & PlaywrightTestOptions) => Promise<void> {
    return async ({ page }) => {
        await page.goto(`/`);
        await page.setContent(config.pageContent);
        await page.addScriptTag({ type: 'module', url: `/build/hyperlinksPlusPlus.js` });
        await config.assertions(page);
    };
}

interface TestConfig {
    pageContent: string;
    assertions: (page: Page) => Promise<void>;
}

function at(page: Page) {
    return {
        assertTarget: (target: string) => ({
            hasInnerText: async (innerText: string) => {
                const targetElement = await page.$(`#${target}`);
                let contentText = (await targetElement?.innerText())?.toLowerCase();
                expect(contentText).not.toMatch(/(404)|(error)|(not found)|(enoent)|(no such file)/);

                const loadedContent = await targetElement?.waitForSelector('#loaded-content');
                const loadedContentText = await loadedContent?.innerText();
                expect(loadedContentText).toBe(innerText);
            }
        })
    }
}
