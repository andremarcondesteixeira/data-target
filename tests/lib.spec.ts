import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
    await page.goto(`${process.env.URL}`);
    await page.setContent(`
        <div id="content"></div>
        <a href="/tests/content.html" data-target-id="content" data-init>load</a>
    `);
    await page.addScriptTag({ type: 'module', url: `${process.env.URL}/dist/lib.js` });
    await page.click('a');
    const loadedContent = await page.textContent('#loaded-content');
    expect(loadedContent).toBe('loaded content');
});
