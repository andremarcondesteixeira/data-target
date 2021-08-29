import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
    await page.goto(`${process.env.URL}`);
    await page.setContent(`
        <div id="content"></div>
        <a id="link" href="content.html" data-target-id="content" data-init>load</a>
    `);
    await page.addScriptTag({ type: 'module', url: `${process.env.URL}/build/hyperlinksPlusPlus.js` });
    await page.click('#link');

    const content = await page.$('#content');
    let contentText = (await content.innerText()).toLowerCase();
    expect(contentText).not.toMatch(/(404)|(error)|(not found)/);

    const loadedContent = await content.waitForSelector('#loaded-content');
    const loadedContentText = await loadedContent.innerText();
    expect(loadedContentText).toBe('loaded content');
});
