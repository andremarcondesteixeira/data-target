import { expect } from "@playwright/test";
import {
    HyperlinksPlusPlusDOMContentLoadedEventDetail,
    PageConsumer,
    PlaywrightFixtures,
    TargetElementIdVsLoadedFileName,
    TestDefinition,
    WithPageContentFixture
} from "./types";
import { EventLogObservable, readPageFileContent, targetElementHasReceivedContent } from "./util";

export default async function withPageContent(
    { page }: PlaywrightFixtures,
    use: (r: (html: string) => WithPageContentFixture) => Promise<void>
) {
    await use((html: string): WithPageContentFixture => {
        const callbacks: PageConsumer[] = [];
        const targetsLoadedFiles: TargetElementIdVsLoadedFileName[] = [];
        const fixture = {
            expectThatTarget: (target: string) => ({
                receivedContentFromPage: (filename: string) => {
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

async function runTest({ page, pageHTMLContent, actions, targetsLoadedFiles }: TestDefinition) {
    await page.goto(`/`);
    await page.setContent(pageHTMLContent);

    const notifier = new EventLogObservable();
    await page.exposeFunction('logEventDetail', (eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) => {
        notifier.push(eventDetail);
    });
    await page.addScriptTag({
        content: `
            addEventListener('HyperLinksPlusPlus:DOMContentLoaded', event => {
                logEventDetail(event.detail);
            });
        `
    });

    await page.addScriptTag({ type: 'module', url: `/build/hyperlinksPlusPlus.js` });

    for (let cb of actions) {
        await cb(page);
    }

    await Promise.all(targetsLoadedFiles.map(({ targetElementId, loadedFileName }) => (async () => {
        await targetElementHasReceivedContent(targetElementId, loadedFileName, notifier);
        const targetElement = await page.$(`#${targetElementId}`);
        const actualInnerHTML = (await targetElement?.innerHTML()).trim();
        const expectedInnerHTML = (await readPageFileContent(loadedFileName)).trim();
        expect(actualInnerHTML).toBe(expectedInnerHTML);
    })()));
}
