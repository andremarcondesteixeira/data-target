import { test, expect } from '@playwright/test';

test.describe('basic functionality', () => {
    test('clicking an anchor with a data-target-id attribute will load the content inside the element whose id matches the attribute', async ({ page }) => {
        await page.goto(`${process.env['URL']}`);
        await page.setContent(`
            <a id="link" href="content.html" data-target="content">load</a>
            <div id="content"></div>
        `);
        await page.addScriptTag({ type: 'module', url: `${process.env['URL']}/build/hyperlinksPlusPlus.js` });

        page.on('load', async () => {
            await page.click('#link');

            const content = await page.$('#content');
            let contentText = (await content?.innerText())?.toLowerCase();
            expect(contentText).not.toMatch(/(404)|(error)|(not found)|(enoent)|(no such file)/);

            const loadedContent = await content?.waitForSelector('#loaded-content');
            const loadedContentText = await loadedContent?.innerText();
            expect(loadedContentText).toBe('loaded content');
        });
    });

    test('an anchor with a data-init atribute will load automatically', async ({ page }) => {
        page.on("console", message => console.log(message));
        await page.goto(`${process.env['URL']}`);
        await page.setContent(`
            <a id="link" href="content.html" data-target="content" data-init>load</a>
            <div id="content"></div>
        `);
        await page.addScriptTag({ type: 'module', url: `${process.env['URL']}/build/hyperlinksPlusPlus.js` });
        page.on('load', async () => {
            const content = await page.$('#content');
            let contentText = (await content?.innerText())?.toLowerCase();
            expect(contentText).not.toMatch(/(404)|(error)|(not found)|(enoent)|(no such file)/);

            const loadedContent = await content?.waitForSelector('#loaded-content');
            const loadedContentText = await loadedContent?.innerText();
            expect(loadedContentText).toBe('loaded content');
        });
    });
});
