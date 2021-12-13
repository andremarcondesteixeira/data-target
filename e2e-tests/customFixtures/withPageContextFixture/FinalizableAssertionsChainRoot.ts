import { AssertionsChainStart } from "./AssertionsChainStart";
import { TestRunner } from "./TestRunner";

export class FinalizableAssertionsChainRoot {
    constructor(
        private assertionsChainRoot: AssertionsChainStart,
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        return this.assertionsChainRoot.expectThat();
    }

    runTest() {
        return this.testRunner.run();
    }
}
