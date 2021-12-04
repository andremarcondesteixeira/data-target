import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { PrepareContextFixtureArgs } from "../prepareContextFixture";

export class TestRunner {
    constructor(
        private html: string,
        private actions: ((page: Page) => Promise<void>)[],
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[],
        private prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>,
        private createEventLogger: (page: Page) => Promise<EventLogger>,
    ) { }

    async run() {
        let eventLogger: EventLogger;

        const page = await this.prepareContext({
            pageContent: this.html,
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
