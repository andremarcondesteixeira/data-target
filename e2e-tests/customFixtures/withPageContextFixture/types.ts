import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { PrepareContextFixtureArgs } from "../prepareContextFixture";
import { LoadEventDetail } from "../sharedTypes";

export type PageConsumer = (page: Page) => Promise<void>;

export type WithPageContentFixtureFirstAssertion = {
    expectThat: () => {
        element: (target: string) => {
            hasSameContentOf: (filename: string) => WithPageContentFixtureAssertions;
        };
        browserURLEndsWith: (url: string) => WithPageContentFixtureAssertions;
        loadEvent: () => {
            hasBeenDispatchedWithDetails: (details: LoadEventDetail) => WithPageContentFixtureAssertions;
        };
    };
};

export type WithPageContentFixtureAssertions = {
    and: () => WithPageContentFixtureFirstAssertion & {
        runTest: () => Promise<void>;
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
