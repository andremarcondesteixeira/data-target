import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { Assertions } from "./Assertions";
import { Continuation } from "./Continuation";
import { TestRunner } from "./TestRunner";

export class AssertionsEntryPoint {
    constructor(
        private html: string,
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [],
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        const continuation = new Continuation(this, this.testRunner);
        return new Assertions(this.html, this.assertions, continuation);
    }
}
