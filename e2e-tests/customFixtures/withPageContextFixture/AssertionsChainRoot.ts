import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { AssertionsChain } from "./AssertionsChain";
import { ContinuationChain } from "./ContinuationChain";
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
        return new AssertionsChain(this.html, this.assertions, continuation);
    }
}
