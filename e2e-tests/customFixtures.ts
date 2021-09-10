import { expect, Page, test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type CustomFixtures = {
    withPageContent: (html: string) => WithPageContentFixture
};

type WithPageContentFixture = {
    expectThatTarget: (target: string) => {
        receivedContentFromFile: (filename: string) => {
            test: () => Promise<void>;
            and: () => WithPageContentFixture
        }
    };
    do: (callback: PageConsumer) => WithPageContentFixture
};

type PageConsumer = (page: Page) => Promise<void>;

type TargetLoadedFile = {
    targetElementId: string;
    loadedFileName: string;
}

type ContentLoadedEventDetail = {
    url: string;
    targetElementId: string;
    responseStatusCode: number;
};

type TestDefinition = {
    page: Page;
    pageHTMLContent: string;
    actions: PageConsumer[];
    targetsLoadedFiles: TargetLoadedFile[]
};

export const test = base.extend<CustomFixtures>({
    withPageContent: async ({ page }, use) => {
        await use((html: string) => {
            const callbacks: PageConsumer[] = [];
            const targetsLoadedFiles: TargetLoadedFile[] = [];
            const fixture = {
                expectThatTarget: (target: string) => ({
                    receivedContentFromFile: (filename: string) => {
                        targetsLoadedFiles.push({
                            targetElementId: target,
                            loadedFileName: filename
                        });
                        return {
                            test: async () => {
                                await runTest({
                                    page,
                                    pageHTMLContent: html,
                                    actions: callbacks,
                                    targetsLoadedFiles
                                });
                            },
                            and: () => fixture
                        }
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

async function runTest({ page, pageHTMLContent, actions, targetsLoadedFiles }: TestDefinition) {
    await page.goto(`/`);
    await page.setContent(pageHTMLContent);

    await page.addScriptTag({ type: 'module', url: `/build/hyperlinksPlusPlus.js` });

    for (let cb of actions) {
        await cb(page);
    }

    await Promise.all(targetsLoadedFiles.map(({ targetElementId, loadedFileName }) => (async () => {
        const targetElement = await page.$(`#${targetElementId}`);
        const actualInnerHTML = (await targetElement?.innerHTML()).trim();
        const expectedInnerHTML = (await readFile(loadedFileName)).trim();
        expect(actualInnerHTML).toBe(expectedInnerHTML);
    })()));
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
