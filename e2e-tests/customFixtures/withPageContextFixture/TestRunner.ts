import { Page } from "@playwright/test";
import { AnchorDataTargetLoadEventObserver } from "../anchorDataTargetLoadEventListener";
import { PrepareContextFixtureArgs } from "../prepareContext";

export class TestRunner {
    constructor(
        private withPageContentHtml: string,
        private actions: ((page: Page) => Promise<void>)[],
        private assertions: ((page: Page, eventLogger: AnchorDataTargetLoadEventObserver) => Promise<void>)[],
        private prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>,
        private createEventLogger: (page: Page) => Promise<AnchorDataTargetLoadEventObserver>,
    ) { }

    async run() {
        let eventLogger: AnchorDataTargetLoadEventObserver;

        const page = await this.prepareContext({
            pageContent: this.withPageContentHtml,
            beforeLoadingLib: async (page: Page) => {
                eventLogger = await this.createEventLogger(page);
            },
        });

        for (let action of this.actions) {
            await action(page);
        }

        await Promise.all(this.assertions.map(fn => fn(page, eventLogger)));
    }
}
