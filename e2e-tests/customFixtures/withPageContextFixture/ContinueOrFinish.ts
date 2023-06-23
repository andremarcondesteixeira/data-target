import { AssertionsEntryPointInterface, ContinueOrFinishInterface } from "../types";
import { TestRunner } from "./TestRunner";

export class ContinueOrFinish implements ContinueOrFinishInterface {
    constructor(
        private entryPoint: AssertionsEntryPointInterface,
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        return this.entryPoint.expectThat();
    }

    runTest() {
        return this.testRunner.run();
    }
}
