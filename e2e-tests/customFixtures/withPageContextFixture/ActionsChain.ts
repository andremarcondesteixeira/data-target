import { Page } from "@playwright/test";
import { AssertionsChainRoot } from "./AssertionsChainRoot";
import { PageConsumer } from "./types";

export class ActionsChain {
    constructor(
        private actions: PageConsumer[],
        private assertionsChainRoot: AssertionsChainRoot,
    ) { }

    do(callback: PageConsumer) {
        this.actions.push(callback);
        return this;
    }

    click(selector: string) {
        this.actions.push(async (page: Page) => await page.click(selector));
        return this;
    }

    then() {
        return this.assertionsChainRoot;
    }
}
