import { PlaywrightFixtures } from "../sharedTypes";
import { ActionsChain } from "./ActionsChain";
import { AssertionsChainRoot } from "./AssertionsChainRoot";
import { TestRunner } from "./TestRunner";
import { CustomFixtures, State } from "./types";
import { WithPageContentFixture } from "./withPageContentFixture";

export default async function withPageContent(
    { prepareContext, createEventLogger }: PlaywrightFixtures,
    use: (r: (html: string) => WithPageContentFixture) => Promise<void>
): Promise<void> {
    await use((html: string): WithPageContentFixture => {
        return makeFixture(html, { prepareContext, createEventLogger });
    });
}

function makeFixture(html: string, fixtures: CustomFixtures): WithPageContentFixture {
    const state: State = { actions: [], assertions: [] };
    const testRunner = new TestRunner(html, state, fixtures);
    const assertionsChainRoot = new AssertionsChainRoot(html, state.assertions, testRunner);
    const actionsChain = new ActionsChain(state.actions, assertionsChainRoot);
    return new WithPageContentFixture(actionsChain, assertionsChainRoot);
}
