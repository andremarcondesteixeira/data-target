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
        browserURLEndsWith: (url: string) => WithPageContentFixtureAssertions
    };
};

type WithPageContentFixtureAssertions = {
    and: () => WithPageContentFixtureFirstAssertion & {
        runTest: () => Promise<void>;
    };
};

export default async function withPageContent(
    { prepareContext, createEventLogger }: PlaywrightFixtures,
    use: (r: (html: string) => WithPageContentFixture) => Promise<void>
) {
    await use((html: string): WithPageContentFixture => {
        const actions: PageConsumer[] = [];
        const assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [];

        const assertionChainStart: WithPageContentFixtureFirstAssertion = {
            expectThat: function() {
                return {
                    element: (selector: string) => ({
                        hasSameContentOf: (filename: string) => {
                            assertions.push(async (page: Page, eventLogger: EventLogger) => {
                                await waitUntilTargetElementHasReceivedContent(selector, filename, eventLogger);
                                const targetElement = await page.$(selector);
                                const actualInnerHTML = (await targetElement.innerHTML()).trim();
                                const expectedInnerHTML = (await readFileContent(filename)).trim();
                                expect(actualInnerHTML).toBe(expectedInnerHTML);
                            });
                            return {
                                and: () => ({
                                    ...this,
                                    runTest,
                                }),
                            };;
                        },
                    }),
                    browserURLEndsWith: (url: string) => {
                        assertions.push(async (page: Page) => {
                            expect(page.url().endsWith(url)).toBeTruthy();
                        });
                        return {
                            and: () => ({
                                ...this,
                                runTest,
                            }),
                        };;
                    },
                };
            },
        };

        const actionChain: WithPageContentFixtureActions = {
            do: (callback: PageConsumer) => {
                actions.push(callback);
                return actionChain;
            },
            click: (selector: string) => {
                actions.push(async (page: Page) => await page.click(selector));
                return actionChain;
            },
            then: () => assertionChainStart,
        };

        return {
            ...actionChain,
            ...assertionChainStart,
        };

        async function runTest() {
            let eventLogger: EventLogger;

            const page = await prepareContext({
                pageContent: html,
                beforeLoadingLib: async (page: Page) => {
                    eventLogger = await createEventLogger(page);
                },
            });

            for (let action of actions)
                await action(page);

            await Promise.all(assertions.map(fn => fn(page, eventLogger)));
        }
    });
}
