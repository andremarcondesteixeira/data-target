import { AssertionsEntryPoint } from "./AssertionsEntryPoint";
import { ContinueOrFinish } from "./ContinueOrFinish";
import { TestRunner } from "./TestRunner";

export class Continuation {
    private continueOrFinish: ContinueOrFinish;

    constructor(assertions: AssertionsEntryPoint, testRunner: TestRunner) {
        this.continueOrFinish = new ContinueOrFinish(assertions, testRunner);
    }

    and() {
        return this.continueOrFinish;
    }
}
