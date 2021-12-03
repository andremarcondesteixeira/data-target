import { expect, Page } from "@playwright/test";
import { EventLogger, waitUntilTargetElementHasReceivedContent } from "./createEventLoggerFixture";
import { PrepareContextFixtureArgs } from "./prepareContextFixture";
import { LoadEventDetail, PlaywrightFixtures } from "./sharedTypes";
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
            hasSameContentOf: (filename: string) => WithPageContentFixtureAssertions;
        };
        browserURLEndsWith: (url: string) => WithPageContentFixtureAssertions;
        loadEvent: () => {
            hasBeenDispatchedWithDetails: (details: LoadEventDetail) => WithPageContentFixtureAssertions;
        };
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
): Promise<void> {
    await use((html: string): WithPageContentFixture => {
        return createFixture(html,  prepareContext, createEventLogger);
    });
}

function createFixture(
    html: string,
    prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>,
    createEventLogger: (page: Page) => Promise<EventLogger>
) {
    const actions: PageConsumer[] = [];
    const assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [];

    const assertionChainStart: WithPageContentFixtureFirstAssertion = {
        expectThat: function () {
            const chain = {
                and: () => ({
                    ...this,
                    runTest,
                }),
            };

            return {
                element: (selector: string) => ({
                    hasSameContentOf: (filename: string) => {
                        assertions.push(async (page: Page, eventLogger: EventLogger) => {
                            const targetSelector = await page.evaluate(args => {
                                const [html, elementSelector] = args;
                                const div = window.document.createElement('div');
                                div.insertAdjacentHTML('afterbegin', html);
                                const desiredTarget = div.querySelector(elementSelector);
                                const anchors = Array.from(div.querySelectorAll('a[data-target]'));
                                const targetSelector = anchors.map(a => {
                                    return a.getAttribute('data-target');
                                }).filter(targetSelector => {
                                    const targetForThisAnchor = div.querySelector(targetSelector);
                                    return targetForThisAnchor === desiredTarget;
                                })[0];
                                return targetSelector;
                            }, [html, selector]);

                            await waitUntilTargetElementHasReceivedContent(targetSelector, filename, eventLogger);

                            const targetElement = await page.$(selector);
                            const actualInnerHTML = (await targetElement.innerHTML()).trim();
                            const expectedInnerHTML = (await readFileContent(filename)).trim();
                            expect(actualInnerHTML).toBe(expectedInnerHTML);
                        });
                        return chain;
                    },
                }),
                browserURLEndsWith: (url: string) => {
                    assertions.push(async (page: Page) => {
                        expect(page.url().endsWith(url)).toBeTruthy();
                    });
                    return chain;
                },
                loadEvent: () => ({
                    hasBeenDispatchedWithDetails: (expectedDetails: LoadEventDetail) => {
                        const assertion = async (_: Page, eventLogger: EventLogger) => {
                            const eventDetail = await new Promise<LoadEventDetail>(resolve => {
                                eventLogger.subscribe({
                                    notify: (eventDetail: LoadEventDetail) => {
                                        resolve(eventDetail);
                                    },
                                });
                            });
                            expect(eventDetail).toEqual(expectedDetails);
                        };
                        assertions.push(assertion);
                        return chain;
                    },
                }),
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
}
