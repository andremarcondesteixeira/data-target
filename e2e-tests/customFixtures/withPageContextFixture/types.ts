import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { PrepareContextFixtureArgs } from "../prepareContextFixture";

export type PageConsumer = (page: Page) => Promise<void>;

export type CustomFixtures = {
    prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>;
    createEventLogger: (page: Page) => Promise<EventLogger>;
};

export type State = {
    actions: PageConsumer[];
    assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[];
};
