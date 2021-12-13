import { AssertionsChainStart } from "./AssertionsChainStart";
import { FinalizableAssertionsChainRoot } from "./FinalizableAssertionsChainRoot";
import { TestRunner } from "./TestRunner";

export class ContinuationChain {
    private assertionsOrRunTest: FinalizableAssertionsChainRoot;

    constructor(assertions: AssertionsChainStart, testRunner: TestRunner) {
        this.assertionsOrRunTest = new FinalizableAssertionsChainRoot(assertions, testRunner);
    }

    and() {
        return this.assertionsOrRunTest;
    }
}
