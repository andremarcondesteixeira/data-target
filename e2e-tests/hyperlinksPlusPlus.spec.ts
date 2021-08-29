import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
    await page.goto(`${process.env.URL}`);
    await page.setContent(`
        <div id="content"></div>
        <a id="link" href="/tests/content.html" data-target-id="content" data-init>load</a>
    `);
    await page.addScriptTag({ type: 'module', url: `${process.env.URL}/build/hyperlinksPlusPlus.js` });
    await page.click('#link', {
        noWaitAfter: true,
        strict: true,
        force: true
    });

    const loadedContent = await page.waitForSelector('#loaded-content');
    const loadedText = await loadedContent.innerText();
    expect(loadedText).toBe('loaded content');
});
