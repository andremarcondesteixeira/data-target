import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
    page.evaluate(() => {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="content"></div>
            <a href="content.html" data-target-id="content" data-init>load</a>
            <script src="../src/lib.ts" type="module"></script>
        `);
    });

    page.addScriptTag({path: '../src'})

    const result = await page.evaluate(() => (document.querySelector('#loaded-content') as HTMLDivElement).innerText);

    expect(result).toBe('loaded content');
});
