import { Page, expect } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { LoadEventDetail } from "../sharedTypes";
import { ContinuationChain } from "./ContinuationChain";
import { ElementAssertion } from "./ElementAssertion";
import { TestRunner } from "./TestRunner";
import { WithPageContentFixtureFirstAssertion } from "./types";

export class AssertionsChainRoot implements WithPageContentFixtureFirstAssertion {
    constructor(
        private html: string,
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [],
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        const continuation = new ContinuationChain(this, this.testRunner);

        return {
            element: (selector: string) => {
                return new ElementAssertion(this.html, this.assertions, selector, continuation);
            },
            browserURLEndsWith: (url: string) => {
                this.assertions.push(async (page: Page) => {
                    expect(page.url().endsWith(url)).toBeTruthy();
                });
                return continuation;
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
                    return continuation;
                },
            }),
        };
    }
}
