import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { PrepareContextFixtureArgs } from "../prepareContextFixture";
import { LoadEventDetail } from "../sharedTypes";
import { ContinuationChain } from "./ContinuationChain";

export type PageConsumer = (page: Page) => Promise<void>;

export type WithPageContentFixtureFirstAssertion = {
    expectThat: () => {
        element: (target: string) => {
            hasSameContentOf: (filename: string) => ContinuationChain;
        };
        browserURLEndsWith: (url: string) => ContinuationChain;
        loadEvent: () => {
            hasBeenDispatchedWithDetails: (details: LoadEventDetail) => ContinuationChain;
        };
    };
};

export type CustomFixtures = {
    prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>;
    createEventLogger: (page: Page) => Promise<EventLogger>;
};

export type State = {
    actions: PageConsumer[];
    assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[];
};
