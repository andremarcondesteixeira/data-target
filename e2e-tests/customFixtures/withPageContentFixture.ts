import { expect, Page } from "@playwright/test";
import { PlaywrightFixtures } from "./sharedTypes";
import { readFileContent, waitUntilTargetElementHasReceivedContent } from "./util";

type PageConsumer = (page: Page) => Promise<void>

type TargetElementIdVsLoadedFileName = {
    targetElementId: string
    loadedFileName: string
}

export type WithPageContentFixture = {
    expectThatTarget: (target: string) => {
        receivedContentFromPage: (filename: string) => {
            test: () => Promise<void>
            and: () => WithPageContentFixture
        }
    }
    do: (callback: PageConsumer) => WithPageContentFixture
}

export default async function withPageContent(
    { prepareContext }: PlaywrightFixtures,
    use: (r: (html: string) => WithPageContentFixture) => Promise<void>
) {
    await use((html: string): WithPageContentFixture => {
        const callbacks: PageConsumer[] = [];
        const targetElementIdsVsLoadedFileNames: TargetElementIdVsLoadedFileName[] = [];
        const fixture = {
            expectThatTarget: (target: string) => ({
                receivedContentFromPage: (filename: string) => {
                    targetElementIdsVsLoadedFileNames.push({
                        targetElementId: target,
                        loadedFileName: filename
                    });
                    return {
                        test: async () => {
                            const context = await prepareContext(html);
                            await runTest({
                                context,
                                actions: callbacks,
                                targetElementIdsVsLoadedFileNames
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

async function runTest({ actions, context, targetElementIdsVsLoadedFileNames }) {
    for (let cb of actions) {
        await cb(context.page);
    }

    await Promise.all(targetElementIdsVsLoadedFileNames.map(({ targetElementId, loadedFileName }) => (async () => {
        await waitUntilTargetElementHasReceivedContent(targetElementId, loadedFileName, context.eventLogger);
        const targetElement = await context.page.$(`#${targetElementId}`);
        const actualInnerHTML = (await targetElement?.innerHTML()).trim();
        const expectedInnerHTML = (await readFileContent(loadedFileName)).trim();
        expect(actualInnerHTML).toBe(expectedInnerHTML);
    })()));
}
