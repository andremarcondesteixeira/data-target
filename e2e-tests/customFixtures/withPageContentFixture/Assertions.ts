import { Assertion, AssertionsInterface, ContinuationInterface, ElementAssertionsInterface, LoadEventAssertionsInterface } from "../types";
import { ElementAssertions } from "./ElementAssertion";
import { LoadEventAssertions } from "./LoadEventAssertions";

export class Assertions implements AssertionsInterface {
    constructor(
        private assertions: Assertion[] = [],
        private continuation: ContinuationInterface
    ) { }

    element(selector: string): ElementAssertionsInterface {
        return new ElementAssertions(this.assertions, selector, this.continuation);
    }

    loadEvent(): LoadEventAssertionsInterface {
        return new LoadEventAssertions(this.assertions, this.continuation);
    }
}
