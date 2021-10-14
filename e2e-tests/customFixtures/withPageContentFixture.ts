import { expect, Page } from "@playwright/test";
import { EventLogger, waitUntilTargetElementHasReceivedContent } from "./createEventLoggerFixture";
import { PlaywrightFixtures } from "./sharedTypes";
import { readFileContent } from "./util";

export type WithPageContentFixture = WithPageContentFixtureActions & WithPageContentFixtureFirstAssertion;

type WithPageContentFixtureActions = {
    do: (callback: PageConsumer) => WithPageContentFixtureActions;
    click: (selector: string) => WithPageContentFixtureActions;
    then: () => WithPageContentFixtureFirstAssertion;
};

type PageConsumer = (page: Page) => Promise<void>;

type WithPageContentFixtureFirstAssertion = {
    expectThat: () => {
        element: (target: string) => {
            hasSameContentOf: (filename: string) => WithPageContentFixtureAssertions
        };
    };
};

type WithPageContentFixtureAssertions = {
    and: () => WithPageContentFixtureFirstAssertion & {
        runTest: () => Promise<void>;
    };
};

type TargetElementIdVsLoadedFileName = {
    targetElementId: string
    loadedFileName: string
};

export default async function withPageContent(
    { prepareContext, createEventLogger }: PlaywrightFixtures,
    use: (r: (html: string) => WithPageContentFixture) => Promise<void>
) {
    await use((html: string): WithPageContentFixture => {
        const actionCallbacks: PageConsumer[] = [];
        const targetElementIdsVsLoadedFileNames: TargetElementIdVsLoadedFileName[] = [];

        const assertions: WithPageContentFixtureFirstAssertion = {
            expectThat: () => ({
                element: (target: string) => ({
                    hasSameContentOf: (filename: string) => {
                        targetElementIdsVsLoadedFileNames.push({
                            targetElementId: target,
                            loadedFileName: filename
                        });

                        return {
                            and: () => ({
                                ...assertions,
                                runTest: async () => {
                                    let eventLogger: EventLogger;
                                    const page = await prepareContext({
                                        pageContent: html,
                                        beforeLoadingLib: async (page: Page) => {
                                            eventLogger = await createEventLogger(page);
                                        }
                                    });
                                    await runTest(actionCallbacks, eventLogger, page, targetElementIdsVsLoadedFileNames);
                                },
                            }),
                        };
                    },
                }),
            }),
        };

        const actions: WithPageContentFixtureActions = {
            do: (callback: PageConsumer) => {
                actionCallbacks.push(callback);
                return actions;
            },
            click: (selector: string) => {
                actionCallbacks.push(async (page: Page) => await page.click(selector));
                return actions;
            },
            then: () => assertions,
        };

        return {
            ...actions,
            ...assertions,
        };
    });
}

async function runTest(
    actions: PageConsumer[],
    eventLogger: EventLogger,
    page: Page,
    targetElementIdsVsLoadedFileNames: TargetElementIdVsLoadedFileName[]
) {
    await executeAllActions(actions, page);
    await executeAllAssertions(targetElementIdsVsLoadedFileNames, eventLogger, page);
}

async function executeAllActions(actions: PageConsumer[], page: Page) {
    for (let action of actions) {
        await action(page);
    }
}

async function executeAllAssertions(
    targetElementIdsVsLoadedFileNames: TargetElementIdVsLoadedFileName[],
    eventLogger: EventLogger,
    page: Page
) {
    const createAssertion = (targetElementId: string, loadedFileName: string) => async () => {
        await waitUntilTargetElementHasReceivedContent(targetElementId, loadedFileName, eventLogger);
        const targetElement = await page.$(`#${targetElementId}`);
        const actualInnerHTML = (await targetElement?.innerHTML()).trim();
        const expectedInnerHTML = (await readFileContent(loadedFileName)).trim();
        expect(actualInnerHTML).toBe(expectedInnerHTML);
    };
    const assertions = targetElementIdsVsLoadedFileNames.map(({ targetElementId, loadedFileName }) => {
        return createAssertion(targetElementId, loadedFileName)
    });
    const results = assertions.map(assertion => assertion());
    await Promise.all(results);
}
