import { expect, Page } from "@playwright/test";
import { EventLogger, waitUntilTargetElementHasReceivedContent } from "./createEventLoggerFixture";
import { PlaywrightFixtures } from "./sharedTypes";
import { readFileContent } from "./util";

type PageConsumer = (page: Page) => Promise<void>

type TargetElementIdVsLoadedFileName = {
    targetElementId: string
    loadedFileName: string
}

export type WithPageContentFixture = {
    expectThatTarget: (target: string) => {
        receivedContentFrom: (filename: string) => {
            test: () => Promise<void>
            and: () => WithPageContentFixture
        }
    }
    do: (callback: PageConsumer) => WithPageContentFixture
}

export default async function withPageContent(
    { prepareContext, createEventLogger }: PlaywrightFixtures,
    use: (r: (html: string) => WithPageContentFixture) => Promise<void>
) {
    await use((html: string): WithPageContentFixture => {
        const callbacks: PageConsumer[] = [];
        const targetElementIdsVsLoadedFileNames: TargetElementIdVsLoadedFileName[] = [];
        const fixture = {
            expectThatTarget: (target: string) => ({
                receivedContentFrom: (filename: string) => {
                    targetElementIdsVsLoadedFileNames.push({
                        targetElementId: target,
                        loadedFileName: filename
                    });
                    return {
                        test: async () => {
                            let eventLogger: EventLogger;
                            const page = await prepareContext({
                                pageContent: html,
                                beforeLoadingLib: async (page: Page) => {
                                   eventLogger = await createEventLogger(page);
                                }
                            });
                            await runTest({
                                actions: callbacks,
                                eventLogger,
                                page,
                                targetElementIdsVsLoadedFileNames,
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

async function runTest({ actions, eventLogger, page, targetElementIdsVsLoadedFileNames }) {
    for (let cb of actions) {
        await cb(page);
    }

    await Promise.all(targetElementIdsVsLoadedFileNames.map(({ targetElementId, loadedFileName }) => (async () => {
        await waitUntilTargetElementHasReceivedContent(targetElementId, loadedFileName, eventLogger);
        const targetElement = await page.$(`#${targetElementId}`);
        const actualInnerHTML = (await targetElement?.innerHTML()).trim();
        const expectedInnerHTML = (await readFileContent(loadedFileName)).trim();
        expect(actualInnerHTML).toBe(expectedInnerHTML);
    })()));
}
