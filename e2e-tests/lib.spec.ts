import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
    await page.goto(`${process.env.URL}`);
    await page.setContent(`
        <div id="content"></div>
        <a href="/tests/content.html" data-target-id="content" data-init>load</a>
    `);
    await page.addScriptTag({ type: 'module', url: `${process.env.URL}/dist/lib.js` });
    await page.click('a');
    const contentReceiver = await page.$('#content');
    const loadedContent = await contentReceiver.$('#loaded-content');
    const loadedText = await loadedContent.innerText();
    expect(loadedText).toBe('loaded content');
});
