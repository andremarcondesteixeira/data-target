import { Page } from "@playwright/test";
import { AnchorDataTargetLoadEventObserver } from "../anchorDataTargetLoadEventListener";
import { Continuation } from "./Continuation";
import { ElementAssertions } from "./ElementAssertion";
import { LoadEventAssertions } from "./LoadEventAssertions";

export class Assertions {
    constructor(
        private withPageContentHtml: string,
        private assertions: ((page: Page, eventLogger: AnchorDataTargetLoadEventObserver) => Promise<void>)[] = [],
        private continuation: Continuation
    ) { }

    element(selector: string) {
        return new ElementAssertions(this.withPageContentHtml, this.assertions, selector, this.continuation);
    }

    loadEvent() {
        return new LoadEventAssertions(this.assertions, this.continuation);
    }
}
