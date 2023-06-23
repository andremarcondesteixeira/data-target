import { Page } from "@playwright/test";
import { AnchorDataTargetLoadEventObserver } from "../anchorDataTargetLoadEventObserver";
import { PreparePageFixtureArgs } from "../preparePage";
import { PlaywrightFixtures } from "../types";
import { Actions } from "./Actions";
import { AssertionsEntryPoint } from "./AssertionsEntryPoint";
import { TestRunner } from "./TestRunner";

export async function withPageContent(
    { preparePage: prepareContext, createAnchorDataTargetLoadEventObserver: createAnchorDataTargetLoadEventListener }: PlaywrightFixtures,
    use: (r: (withPageContentHtml: string) => Actions) => Promise<void>
): Promise<void> {
    await use((withPageContentHtml: string): Actions => {
        return makeFixture(withPageContentHtml, prepareContext, createAnchorDataTargetLoadEventListener);
    });
}

function makeFixture(
    withPageContentHtml: string,
    prepareContext: (args: PreparePageFixtureArgs) => Promise<Page>,
    createAnchorDataTargetLoadEventListener: (page: Page) => Promise<AnchorDataTargetLoadEventObserver>,
): Actions {
    const actions: ((page: Page) => Promise<void>)[] = [];
    const assertions: ((page: Page, eventLogger: AnchorDataTargetLoadEventObserver) => Promise<void>)[] = [];
    const testRunner = new TestRunner(withPageContentHtml, actions, assertions, prepareContext, createAnchorDataTargetLoadEventListener);
    const entryPoint = new AssertionsEntryPoint(withPageContentHtml, assertions, testRunner);
    return new Actions(actions, entryPoint);
}
