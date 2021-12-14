import { AssertionsEntryPoint } from "./AssertionsEntryPoint";
import { TestRunner } from "./TestRunner";

export class ContinueOrFinish {
    constructor(
        private entryPoint: AssertionsEntryPoint,
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        return this.entryPoint.expectThat();
    }

    runTest() {
        return this.testRunner.run();
    }
}
