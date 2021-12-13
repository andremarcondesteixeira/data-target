import { Page } from "@playwright/test";
import { AssertionsChainStart } from "./AssertionsChainStart";

export class ActionsChain {
    constructor(
        private actions: ((page: Page) => Promise<void>)[],
        private assertionsChainRoot: AssertionsChainStart,
    ) { }

    do(callback: (page: Page) => Promise<void>) {
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