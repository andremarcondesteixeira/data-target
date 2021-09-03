import { expect, Page, PlaywrightTestArgs, PlaywrightTestOptions, test } from '@playwright/test';

test.describe('basic functionality', () => {
    test('clicking an anchor with a data-target-id attribute will load the content inside the element whose id matches the attribute', prepare({
        pageContent: `
            <a id="link" href="content.html" data-target="content">load</a>
            <div id="content"></div>
        `,
        assertions: async page => {
            await page.click('#link');

            const content = await page.$('#content');
            let contentText = (await content?.innerText())?.toLowerCase();
            expect(contentText).not.toMatch(/(404)|(error)|(not found)|(enoent)|(no such file)/);

            const loadedContent = await content?.waitForSelector('#loaded-content');
            const loadedContentText = await loadedContent?.innerText();
            expect(loadedContentText).toBe('loaded content');
        }
    }));

    test('an anchor with a data-autoload atribute loads automatically', prepare({
        pageContent: `
            <a href="content.html" data-target="content" data-autoload>load</a>
            <div id="content"></div>
        `,
        assertions: async page => {
            const content = await page.$('#content');
            let contentText = (await content?.innerText())?.toLowerCase();
            expect(contentText).not.toMatch(/(404)|(error)|(not found)|(enoent)|(no such file)/);

            const loadedContent = await content?.waitForSelector('#loaded-content');
            const loadedContentText = await loadedContent?.innerText();
            expect(loadedContentText).toBe('loaded content');
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
