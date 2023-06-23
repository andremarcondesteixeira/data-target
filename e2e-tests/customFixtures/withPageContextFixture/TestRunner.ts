import { Page } from "@playwright/test";
import { AnchorDataTargetLoadEventObserver, AnchorDataTargetLoadEventObserverFixture } from "../anchorDataTargetLoadEventObserver";
import { PreparePageFixture } from "../preparePage";
import { Assertion } from "../types";

export class TestRunner {
    constructor(
        private withPageContentHtml: string,
        private actions: ((page: Page) => Promise<void>)[],
        private assertions: Assertion[],
        private preparePage: PreparePageFixture,
        private createAnchorDataTargetLoadEventObserver: AnchorDataTargetLoadEventObserverFixture,
    ) { }

    async run() {
        let observer: AnchorDataTargetLoadEventObserver;

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
