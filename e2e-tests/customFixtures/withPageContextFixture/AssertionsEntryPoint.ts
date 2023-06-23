import { Assertion, AssertionsEntryPointInterface } from "../types";
import { Assertions } from "./Assertions";
import { Continuation } from "./Continuation";
import { TestRunner } from "./TestRunner";

export class AssertionsEntryPoint implements AssertionsEntryPointInterface {
    constructor(
        private assertions: Assertion[] = [],
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        const continuation = new Continuation(this, this.testRunner);
        return new Assertions(this.assertions, continuation);
    }
}
