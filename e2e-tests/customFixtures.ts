import { expect, Page, test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type CustomFixtures = {
    withPageContent: (html: string) => WithPageContentFixture
};

type WithPageContentFixture = {
    expectedThatTarget: (target: string) => {
        receivedContentFromFile: (filename: string) => {
            test: () => Promise<void>;
        }
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
                    receivedContentFromFile: (filename: string) => ({
                        test: async () => {
                            await runTest({ page, pageHTMLContent: html, actions: callbacks, targetElementId: target, loadedFile: filename });
                        }
                    })
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

type TestDefinition = {
    page: Page;
    pageHTMLContent: string;
    actions: PageConsumer[];
    targetElementId: string;
    loadedFile: string;
};

async function runTest({ page, pageHTMLContent, actions, targetElementId, loadedFile }: TestDefinition) {
    await page.goto(`/`);
    await page.setContent(pageHTMLContent);
    await page.addScriptTag({ type: 'module', url: `/build/hyperlinksPlusPlus.js` });

    for (let cb of actions) {
        await cb(page);
    }

    const targetElement = await page.$(`#${targetElementId}`);
    const actualInnerHTML = (await targetElement?.innerHTML()).trim();
    const expectedInnerHTML = (await readFile(loadedFile)).trim();
    expect(actualInnerHTML).toBe(expectedInnerHTML);
}

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
