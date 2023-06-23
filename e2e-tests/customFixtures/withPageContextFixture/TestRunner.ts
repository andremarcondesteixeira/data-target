import { Page } from "@playwright/test";
import { AnchorDataTargetLoadEventObserverFixture, Assertion, Observer, PreparePageFixture } from "../types";

export class TestRunner {
    constructor(
        private withPageContentHtml: string,
        private actions: ((page: Page) => Promise<void>)[],
        private assertions: Assertion[],
        private preparePage: PreparePageFixture,
        private createAnchorDataTargetLoadEventObserver: AnchorDataTargetLoadEventObserverFixture,
    ) { }

    async run() {
        let observer: Observer;

        const page = await this.preparePage({
            pageContent: this.withPageContentHtml,
            beforeLoadingLib: async (page: Page) => {
                observer = await this.createAnchorDataTargetLoadEventObserver(page);
            },
        });

        for (let action of this.actions) {
            await action(page);
        }

        await Promise.all(this.assertions.map(fn => fn(page, observer)));
    }
}
