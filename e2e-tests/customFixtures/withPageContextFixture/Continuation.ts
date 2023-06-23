import { AssertionsEntryPointInterface, ContinuationInterface, ContinueOrFinishInterface } from "../types";
import { ContinueOrFinish } from "./ContinueOrFinish";
import { TestRunner } from "./TestRunner";

export class Continuation implements ContinuationInterface {
    private continueOrFinish: ContinueOrFinishInterface;

    constructor(assertions: AssertionsEntryPointInterface, testRunner: TestRunner) {
        this.continueOrFinish = new ContinueOrFinish(assertions, testRunner);
    }

    and() {
        return this.continueOrFinish;
    }
}
