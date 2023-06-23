import { Page } from "@playwright/test";
import { AnchorDataTargetLoadEventObserverFixture, Assertion, PlaywrightFixtures, PreparePageFixture } from "../types";
import { Actions } from "./Actions";
import { AssertionsEntryPoint } from "./AssertionsEntryPoint";
import { TestRunner } from "./TestRunner";

export async function withPageContent(
    { preparePage, createAnchorDataTargetLoadEventObserver }: PlaywrightFixtures,
    use: (r: (withPageContentHtml: string) => Actions) => Promise<void>
): Promise<void> {
    await use((withPageContentHtml: string): Actions => {
        return makeFixture(withPageContentHtml, preparePage, createAnchorDataTargetLoadEventObserver);
    });
}

function makeFixture(
    withPageContentHtml: string,
    preparePage: PreparePageFixture,
    createAnchorDataTargetLoadEventListener: AnchorDataTargetLoadEventObserverFixture,
): Actions {
    const actions: ((page: Page) => Promise<void>)[] = [];
    const assertions: Assertion[] = [];
    const testRunner = new TestRunner(withPageContentHtml, actions, assertions, preparePage, createAnchorDataTargetLoadEventListener);
    const entryPoint = new AssertionsEntryPoint(assertions, testRunner);
    return new Actions(actions, entryPoint);
}
