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
        return new WithPageContentFixtureFactory(html,  prepareContext, createEventLogger).create();
    });
}

class WithPageContentFixtureFactory {
    private actions: PageConsumer[];
    private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[];
    private testRunner: TestRunner;

    constructor(
        private html: string,
        private prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>,
        private createEventLogger: (page: Page) => Promise<EventLogger>
    ) {
        this.actions = [];
        this.assertions = [];
        this.testRunner = new TestRunner(
            this.html,
            this.actions,
            this.assertions,
            this.prepareContext,
            this.createEventLogger,
        );
    }

    create(): WithPageContentFixture {
        const self = this;
        const assertionChainStart = new AssertionChainStart(
            this.testRunner,
            this.html,
            this.assertions
        );

        const actionChain: WithPageContentFixtureActions = {
            do: (callback: PageConsumer) => {
                self.actions.push(callback);
                return actionChain;
            },
            click: (selector: string) => {
                self.actions.push(async (page: Page) => await page.click(selector));
                return actionChain;
            },
            then: () => assertionChainStart,
        };

        const result = {
            ...actionChain,
            expectThat: () => assertionChainStart.expectThat(),
        };

        return result;
    }
}

class TestRunner {
    constructor(
        private html: string,
        private actions: PageConsumer[],
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[],
        private prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>,
        private createEventLogger: (page: Page) => Promise<EventLogger>,
    ) { }

    async run() {
        let eventLogger: EventLogger;

        const page = await this.prepareContext({
            pageContent: this.html,
            beforeLoadingLib: async (page: Page) => {
                eventLogger = await this.createEventLogger(page);
            },
        });

        for (let action of this.actions)
            await action(page);

        await Promise.all(this.assertions.map(fn => fn(page, eventLogger)));
    }
}

class AssertionChainStart implements WithPageContentFixtureFirstAssertion {
    constructor(
        private testRunner: TestRunner,
        private html: string,
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [],
    ) {}

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
