import { Page, expect } from "@playwright/test";
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

    browserURLEndsWith(url: string) {
        this.assertions.push(async (page: Page) => {
            expect(page.url().endsWith(url)).toBeTruthy();
        });
        return this.continuation;
    }

    loadEvent() {
        return new LoadEventAssertions(this.assertions, this.continuation);
    }
}
