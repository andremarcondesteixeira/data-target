import { Page } from "@playwright/test";
import { AnchorDataTargetLoadEventObserver } from "../anchorDataTargetLoadEventListener";
import { PrepareContextFixtureArgs } from "../prepareContext";
import { PlaywrightFixtures } from "../sharedTypes";
import { Actions } from "./Actions";
import { AssertionsEntryPoint } from "./AssertionsEntryPoint";
import { TestRunner } from "./TestRunner";
import { WithPageContentFixture } from "./withPageContent";

export default async function withPageContent(
    { prepareContext, createAnchorDataTargetLoadEventListener }: PlaywrightFixtures,
    use: (r: (withPageContentHtml: string) => WithPageContentFixture) => Promise<void>
): Promise<void> {
    await use((withPageContentHtml: string): WithPageContentFixture => {
        return makeFixture(withPageContentHtml, prepareContext, createAnchorDataTargetLoadEventListener);
    });
}

function makeFixture(
    withPageContentHtml: string,
    prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>,
    createAnchorDataTargetLoadEventListener: (page: Page) => Promise<AnchorDataTargetLoadEventObserver>,
): WithPageContentFixture {
    const actions: ((page: Page) => Promise<void>)[] = [];
    const assertions: ((page: Page, eventLogger: AnchorDataTargetLoadEventObserver) => Promise<void>)[] = [];
    const testRunner = new TestRunner(withPageContentHtml, actions, assertions, prepareContext, createAnchorDataTargetLoadEventListener);
    const entryPoint = new AssertionsEntryPoint(withPageContentHtml, assertions, testRunner);
    const actionsChain = new Actions(actions, entryPoint);
    return new WithPageContentFixture(actionsChain, entryPoint);
}
