import { AssertionsChainRoot } from "./AssertionsChainRoot";
import { TestRunner } from "./TestRunner";

export class FinalizableAssertionsChainRoot {
    constructor(
        private assertionsChainRoot: AssertionsChainRoot,
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        return this.assertionsChainRoot.expectThat();
    }

    runTest() {
        return this.testRunner.run();
    }
}
