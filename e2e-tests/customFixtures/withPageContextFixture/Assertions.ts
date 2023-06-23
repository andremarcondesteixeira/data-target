import { Assertion, AssertionsInterface, ContinuationInterface } from "../types";
import { ElementAssertions } from "./ElementAssertion";
import { LoadEventAssertions } from "./LoadEventAssertions";

export class Assertions implements AssertionsInterface {
    constructor(
        private withPageContentHtml: string,
        private assertions: Assertion[] = [],
        private continuation: ContinuationInterface
    ) { }

    element(selector: string) {
        return new ElementAssertions(this.withPageContentHtml, this.assertions, selector, this.continuation);
    }

    loadEvent() {
        return new LoadEventAssertions(this.assertions, this.continuation);
    }
}
