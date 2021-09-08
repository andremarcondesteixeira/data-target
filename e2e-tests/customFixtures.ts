import { expect, Page, test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type CustomFixtures = {
    withPageContent: (html: string) => WithPageContentFixture
};

type WithPageContentFixture = {
    expectedThatTarget: (target: string) => {
        receivedContentFromFile: (filename: string) => Promise<void>;
    };
    do: (callback: PageConsumer) => WithPageContentFixture
};

type PageConsumer = (page: Page) => Promise<void>;

const test = base.extend<CustomFixtures>({
    withPageContent: async ({ page }, use) => {
        await use((html: string) => {
            const callbacks: PageConsumer[] = [];
            const fixture = {
                expectedThatTarget: (target: string) => ({
                    receivedContentFromFile: async (filename: string) => {
                        await page.goto(`/`);
                        await page.setContent(html);
                        await page.addScriptTag({ type: 'module', url: `/build/hyperlinksPlusPlus.js` });

                        for (let cb of callbacks) {
                            await cb(page);
                        }

                        const targetElement = await page.$(`#${target}`);
                        const actualInnerHTML = (await targetElement?.innerHTML()).trim();
                        const expectedInnerHTML = (await readFile(filename)).trim();
                        expect(actualInnerHTML).toBe(expectedInnerHTML);
                    }
                }),
                do: (callback: PageConsumer) => {
                    callbacks.push(callback);
                    return fixture;
                }
            };

            return fixture;
        });
    }
});

async function readFile(filename: string) {
    const stream = fs.createReadStream(path.join(__dirname, ...filename.split('/')), {
        autoClose: true,
        encoding: 'utf-8'
    });

    let content = '';

    for await (const chunk of stream) {
        content += chunk;
    }

    return content;
}

export default test;
