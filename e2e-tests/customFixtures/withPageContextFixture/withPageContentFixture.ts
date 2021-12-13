import { Page } from "@playwright/test";
import { ActionsChain } from "./ActionsChain";
import { AssertionsChainStart } from "./AssertionsChainStart";

export class WithPageContentFixture {
    constructor(
        private actionsChain: ActionsChain,
        private assertionsChainRoot: AssertionsChainStart,
    ) { }

    do(callback: (page: Page) => Promise<void>) {
        return this.actionsChain.do(callback);
    }

    click(selector: string) {
        return this.actionsChain.click(selector);
    }

    then() {
        return this.actionsChain.then();
    }

    expectThat() {
        return this.assertionsChainRoot.expectThat();
    }
}
