import { Page } from "@playwright/test";
import { Actions } from "./Actions";
import { AssertionsEntryPoint } from "./AssertionsEntryPoint";

export class WithPageContentFixture {
    constructor(
        private actions: Actions,
        private entryPoint: AssertionsEntryPoint,
    ) { }

    do(callback: (page: Page) => Promise<void>) {
        return this.actions.do(callback);
    }

    click(selector: string) {
        return this.actions.click(selector);
    }

    then() {
        return this.actions.then();
    }

    expectThat() {
        return this.entryPoint.expectThat();
    }
}
