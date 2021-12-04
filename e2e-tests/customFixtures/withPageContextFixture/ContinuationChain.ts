import { AssertionsChainRoot } from "./AssertionsChainRoot";
import { FinalizableAssertionsChainRoot } from "./FinalizableAssertionsChainRoot";
import { TestRunner } from "./TestRunner";

export class ContinuationChain {
    private assertionsOrRunTest: FinalizableAssertionsChainRoot;

    constructor(assertions: AssertionsChainRoot, testRunner: TestRunner) {
        this.assertionsOrRunTest = new FinalizableAssertionsChainRoot(assertions, testRunner);
    }

    and() {
        return this.assertionsOrRunTest;
    }
}
