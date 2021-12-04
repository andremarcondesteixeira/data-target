import { expect, Page } from "@playwright/test";
import { strict } from "assert/strict";
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

type CustomFixtures = {
    prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>;
    createEventLogger: (page: Page) => Promise<EventLogger>;
};

type State = {
    actions: PageConsumer[];
    assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[];
};

export default async function withPageContent(
    { prepareContext, createEventLogger }: PlaywrightFixtures,
    use: (r: (html: string) => WithPageContentFixture) => Promise<void>
): Promise<void> {
    await use((html: string): WithPageContentFixture => {
        return makeFixture(html, { prepareContext, createEventLogger });
    });
}

function makeFixture(html: string, fixtures: CustomFixtures): WithPageContentFixture {
    const state: State = { actions: [], assertions: [] };
    const testRunner = new TestRunner(html, state, fixtures);
    const assertionChainStart = new AssertionChainStart(html, state.assertions, testRunner);
    const actionChain = new ActionChain(state.actions, assertionChainStart);

    return {
        do: (callback: PageConsumer) => actionChain.do(callback),
        click: (selector: string) => actionChain.click(selector),
        then: () => actionChain.then(),
        expectThat: () => assertionChainStart.expectThat(),
    };
}

class TestRunner {
    constructor(
        private html: string,
        private state: State,
        private fixtures: CustomFixtures,
    ) { }

    async run() {
        let eventLogger: EventLogger;

        const page = await this.fixtures.prepareContext({
            pageContent: this.html,
            beforeLoadingLib: async (page: Page) => {
                eventLogger = await this.fixtures.createEventLogger(page);
            },
        });

        for (let action of this.state.actions)
            await action(page);

        await Promise.all(this.state.assertions.map(fn => fn(page, eventLogger)));
    }
}

class AssertionChainStart implements WithPageContentFixtureFirstAssertion {
    constructor(
        private html: string,
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [],
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        const chain = {
            and: () => ({
                expectThat: () => this.expectThat(),
                runTest: () => this.testRunner.run(),
            }),
        };

        return {
            element: (selector: string) => ({
                hasSameContentOf: (filename: string) => {
                    this.assertions.push(async (page: Page, eventLogger: EventLogger) => {
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
                        }, [this.html, selector]);

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
                this.assertions.push(async (page: Page) => {
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
                    this.assertions.push(assertion);
                    return chain;
                },
            }),
        };
    }
}

class ActionChain {
    constructor(
        private actions: PageConsumer[],
        private assertionChainStart: AssertionChainStart,
    ) { }

    do(callback: PageConsumer) {
        this.actions.push(callback);
        return this;
    }

    click(selector: string) {
        this.actions.push(async (page: Page) => await page.click(selector));
        return this;
    }

    then() {
        return this.assertionChainStart;
    }
}
