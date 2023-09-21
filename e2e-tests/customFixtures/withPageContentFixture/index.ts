import { Page } from "@playwright/test";
import { DataTargetLoadEventObserverFixture, Assertion, PlaywrightFixtures, PreparePageFixture } from "../types";
import { Actions } from "./Actions";
import { AssertionsEntryPoint } from "./AssertionsEntryPoint";
import { TestRunner } from "./TestRunner";

export async function withPageContent(
    { preparePage, createDataTargetLoadEventObserver }: PlaywrightFixtures,
    use: (r: (withPageContentHtml: string) => Actions) => Promise<void>
): Promise<void> {
    await use((withPageContentHtml: string): Actions => {
        return makeFixture(withPageContentHtml, preparePage, createDataTargetLoadEventObserver);
    });
}

function makeFixture(
    withPageContentHtml: string,
    preparePage: PreparePageFixture,
    createDataTargetLoadEventListener: DataTargetLoadEventObserverFixture,
): Actions {
    const actions: ((page: Page) => Promise<void>)[] = [];
    const assertions: Assertion[] = [];
    const testRunner = new TestRunner(withPageContentHtml, actions, assertions, preparePage, createDataTargetLoadEventListener);
    const entryPoint = new AssertionsEntryPoint(assertions, testRunner);
    return new Actions(actions, entryPoint);
}
