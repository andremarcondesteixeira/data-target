import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
    page.goto(`http://localhost:${process.env.SERVER_PORT}`);

    page.setContent(`
        <div id="content"></div>
        <a href="/tests/content.html" data-target-id="content" data-init>load</a>
    `);

    page.addScriptTag({ path: './dist/lib.min.js', type: 'module' })

    page.on('requestfinished', request => {
        console.log(request);
    });
});
