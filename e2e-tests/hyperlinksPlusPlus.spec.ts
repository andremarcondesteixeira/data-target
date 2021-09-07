import { expect, Page, PlaywrightTestArgs, PlaywrightTestOptions, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('basic functionality', () => {
    test('clicking an anchor with a "data-target" attribute will put the response of the http request inside the element with a matching "id" attribute', prepare({
        pageContent: /*html*/ `
            <a id="hyperlink" href="/pages/basic.html" data-target="target-element-id">click me!</a>
            <div id="target-element-id"></div>
        `,
        assertions: async page => {
            await page.click('#hyperlink');
            await at(page).assertTarget('target-element-id').receivedContentFromFile('pages/basic.html');
        }
    }));

    test('clicking an anchor with a data-target attribute works independently of the nesting level of the anchor', prepare({
        pageContent: /*html*/ `
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
        `,
        assertions: async page => {
            await page.click('#nested-anchor');
            await at(page).assertTarget('is-upper-in-the-dom-tree').receivedContentFromFile('pages/requested-from-nested-anchor.html');
        }
    }));

    test('an anchor with a "data-autoload" attribute loads automatically', prepare({
        pageContent: /*html*/ `
            <a href="/pages/basic-automatic.html" data-target="will-get-content-automatically" data-autoload>
                This anchor will dispatch the request automatically after initial page load
            </a>
            <div id="will-get-content-automatically"></div>
        `,
        assertions: async page => {
            await at(page).assertTarget('will-get-content-automatically').receivedContentFromFile('pages/basic-automatic.html');
        }
    }));

    test('an anchor with a "data-autoload" attribute loads automatically independently of the nesting level of the anchor', prepare({
        pageContent: /*html*/ `
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
        `,
        assertions: async page => {
            await at(page).assertTarget('is-upper-in-the-dom-tree').receivedContentFromFile('pages/requested-from-nested-anchor.html');
        }
    }));

    test('Multiple autoload anchors can be defined simultaneously as long as they do not point to the same target', prepare({
        pageContent: /* html */ `
            <a href="/pages/basic.html" data-target="content-1" data-autoload>Loads automatically inside #content-1</a>
            <a href="/pages/basic-automatic.html" data-target="content-2" data-autoload>Loads automatically inside #content-2</a>
            <div id="content-1"></div>
            <div id="content-2"></div>
        `,
        assertions: async page => {
            await Promise.all([
                at(page).assertTarget('content-1').receivedContentFromFile('pages/basic.html'),
                at(page).assertTarget('content-2').receivedContentFromFile('pages/basic-automatic.html'),
            ]);
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
