import { Page } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { PrepareContextFixtureArgs } from "../prepareContextFixture";
import { PlaywrightFixtures } from "../sharedTypes";
import { ActionsChain } from "./ActionsChain";
import { AssertionsChainStart } from "./AssertionsChainStart";
import { TestRunner } from "./TestRunner";
import { WithPageContentFixture } from "./withPageContentFixture";

export default async function withPageContent(
    { prepareContext, createEventLogger }: PlaywrightFixtures,
    use: (r: (html: string) => WithPageContentFixture) => Promise<void>
): Promise<void> {
    await use((html: string): WithPageContentFixture => {
        return makeFixture(html, prepareContext, createEventLogger);
    });
}

function makeFixture(
    html: string,
    prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>,
    createEventLogger: (page: Page) => Promise<EventLogger>,
): WithPageContentFixture {
    const actions: ((page: Page) => Promise<void>)[] = [];
    const assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [];
    const testRunner = new TestRunner(html, actions, assertions, prepareContext, createEventLogger);
    const assertionsChainRoot = new AssertionsChainStart(html, assertions, testRunner);
    const actionsChain = new ActionsChain(actions, assertionsChainRoot);
    return new WithPageContentFixture(actionsChain, assertionsChainRoot);
}
