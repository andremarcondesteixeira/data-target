import { expect, Page, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, test, TestInfo } from '@playwright/test';

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

    test('an anchor with a data-init atribute loads automatically', prepare({
        pageContent: `
            <a id="link" href="content.html" data-target="content" data-init>load</a>
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

function prepare(config: TestConfig): PrepareReturn {
    return async ({ page }: PrepareArgs): Promise<void> => {
        await page.goto(`${process.env['URL']}`);
        await page.setContent(config.pageContent)
        await page.addScriptTag({ type: 'module', url: `${process.env['URL']}/build/hyperlinksPlusPlus.js` })
        page.on('load', () => config.assertions(page));
    };
}

interface TestConfig {
    pageContent: string;
    assertions: (page: Page) => void;
}

type PrepareReturn = (args: PrepareArgs, testInfo: TestInfo) => void | Promise<void>;

type PrepareArgs = PlaywrightTestArgs
    & PlaywrightTestOptions
    & PlaywrightWorkerArgs
    & PlaywrightWorkerOptions;
