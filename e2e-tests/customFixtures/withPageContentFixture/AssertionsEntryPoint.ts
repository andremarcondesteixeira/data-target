import { Assertion, AssertionsEntryPointInterface, AssertionsInterface } from "../types";
import { Assertions } from "./Assertions";
import { Continuation } from "./Continuation";
import { TestRunner } from "./TestRunner";

export class AssertionsEntryPoint implements AssertionsEntryPointInterface {
    constructor(
        private assertions: Assertion[] = [],
        private testRunner: TestRunner,
    ) { }

    expectThat(): AssertionsInterface {
        const continuation = new Continuation(this, this.testRunner);
        return new Assertions(this.assertions, continuation);
    }
}
