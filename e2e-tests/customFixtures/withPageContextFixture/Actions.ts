import { Page } from "@playwright/test";
import { AssertionsEntryPoint } from "./AssertionsEntryPoint";

export class Actions {
    constructor(
        private actions: ((page: Page) => Promise<void>)[],
        private entryPoint: AssertionsEntryPoint,
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
        return this.entryPoint;
    }
}
