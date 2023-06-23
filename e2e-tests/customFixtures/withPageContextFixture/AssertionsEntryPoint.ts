import { Page } from "@playwright/test";
import { AnchorDataTargetLoadEventObserver } from "../anchorDataTargetLoadEventListener";
import { Assertions } from "./Assertions";
import { Continuation } from "./Continuation";
import { TestRunner } from "./TestRunner";

export class AssertionsEntryPoint {
    constructor(
        private withPageContentHtml: string,
        private assertions: ((page: Page, eventLogger: AnchorDataTargetLoadEventObserver) => Promise<void>)[] = [],
        private testRunner: TestRunner,
    ) { }

    expectThat() {
        const continuation = new Continuation(this, this.testRunner);
        return new Assertions(this.withPageContentHtml, this.assertions, continuation);
    }
}
