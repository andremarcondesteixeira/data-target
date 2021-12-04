import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { CustomFixtures, State } from "./types";

export class TestRunner {
    constructor(
        private html: string,
        private state: State,
        private fixtures: CustomFixtures,
    ) { }

    async run() {
        let eventLogger: EventLogger;

        const page = await this.fixtures.prepareContext({
            pageContent: this.html,
            beforeLoadingLib: async (page: Page) => {
                eventLogger = await this.fixtures.createEventLogger(page);
            },
        });

        for (let action of this.state.actions)
            await action(page);

        await Promise.all(this.state.assertions.map(fn => fn(page, eventLogger)));
    }
}
