import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
    await page.goto(`${process.env.URL}`);

    await page.setContent(`
        <div id="content"></div>
        <a href="/tests/content.html" data-target-id="content" data-init>load</a>
    `);

    await page.addScriptTag({ type: 'module', url: `${process.env.URL}/dist/lib.js` });

    expect(true).toBe(true);

    page.on('requestfinished', request => {
        console.log(request);
    });
});
