import { expect, Page, PlaywrightTestArgs, PlaywrightTestOptions, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('basic functionality', () => {
    test('clicking an anchor with a data-target attribute will load the content inside the element whose id matches the attribute', prepare({
        pageContent: /*html*/ `
            <a id="link" href="/pages/page1.html" data-target="content">click me!</a>
            <div id="content"></div>
        `,
        assertions: async page => {
            await page.click('#link');
            await at(page).assertTarget('content').receivedContentFromFile('pages/page1.html');
        }
    }));

    test('an anchor with a data-autoload atribute loads automatically', prepare({
        pageContent: /*html*/ `
            <a href="/pages/page1.html" data-target="content" data-autoload>
                I will make the request by myself after the page is rendered, but just 1 time
            </a>
            <div id="content"></div>
        `,
        assertions: async page => {
            await at(page).assertTarget('content').receivedContentFromFile('pages/page1.html');
        }
    }));

    test('clicking an anchor with a data-target attribute works independently of the nesting level of the anchor', prepare({
        pageContent: /*html*/ `
            <header>
                <nav>
                    <section class="books">
                        <ul>
                            <li>
                                <a id="nested-anchor" href="/pages/page1.html" data-target="main-content">
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
            await at(page).assertTarget('main-content').receivedContentFromFile('pages/page1.html');
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
            receivedContentFromFile: async (filename: string) => {
                const targetElement = await page.$(`#${target}`);
                let actualInnerText = (await targetElement?.innerText())?.toLowerCase();
                expect(actualInnerText).not.toMatch(/(404)|(error)|(not found)|(enoent)|(no such file)/);

                const actualInnerHTML = (await targetElement?.innerHTML()).trim();
                const expectedInnerHTML = (await readFile(filename)).trim();
                expect(actualInnerHTML).toBe(expectedInnerHTML);
            }
        })
    }
}

async function readFile(filename: string) {
    const stream = fs.createReadStream(path.join(__dirname, ...filename.split('/')), {
        autoClose: true,
        encoding: 'utf-8'
    });

    let content = '';

    for await (const chunk of stream) {
        content += chunk;
    }

    return content;
}
