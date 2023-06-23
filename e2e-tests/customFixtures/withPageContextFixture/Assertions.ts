import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { Continuation } from "./Continuation";
import { ElementAssertions } from "./ElementAssertion";
import { LoadEventAssertions } from "./LoadEventAssertions";

export class Assertions {
    constructor(
        private html: string,
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [],
        private continuation: Continuation
    ) { }

    element(selector: string) {
        return new ElementAssertions(this.html, this.assertions, selector, this.continuation);
    }

    loadEvent() {
        return new LoadEventAssertions(this.assertions, this.continuation);
    }
}
