import { expect } from "@playwright/test";
import {
    HyperlinksPlusPlusDOMContentLoadedEventDetail,
    PageConsumer,
    TargetElementIdVsLoadedFileName,
    TestDefinition
} from "./types";
import { readFile } from "./util";

export default async function withPageContent({ page }, use) {
    await use((html: string) => {
        const callbacks: PageConsumer[] = [];
        const targetsLoadedFiles: TargetElementIdVsLoadedFileName[] = [];
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

async function runTest({ page, pageHTMLContent, actions, targetsLoadedFiles }: TestDefinition) {
    await page.goto(`/`);
    await page.setContent(pageHTMLContent);

    const eventDetailLog: HyperlinksPlusPlusDOMContentLoadedEventDetail[] = [];
    await page.exposeFunction('logEventDetail', (eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) => {
        eventDetailLog.push(eventDetail);
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
        const targetElement = await page.$(`#${targetElementId}`);
        const actualInnerHTML = (await targetElement?.innerHTML()).trim();
        const expectedInnerHTML = (await readFile(loadedFileName)).trim();
        expect(actualInnerHTML).toBe(expectedInnerHTML);
    })()));
}
