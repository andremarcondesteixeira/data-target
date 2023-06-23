import { Page } from "@playwright/test";
import { ActionsInterface, AssertionsEntryPointInterface } from "../types";

export class Actions implements ActionsInterface {
    constructor(
        private actions: ((page: Page) => Promise<void>)[],
        private entryPoint: AssertionsEntryPointInterface,
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
