import { PlaywrightFixtures } from "../sharedTypes";
import { ActionsChain } from "./ActionsChain";
import { AssertionsChainRoot } from "./AssertionsChainRoot";
import { TestRunner } from "./TestRunner";
import { CustomFixtures, PageConsumer, State, WithPageContentFixture } from "./types";

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
    const assertionChainStart = new AssertionsChainRoot(html, state.assertions, testRunner);
    const actionChain = new ActionsChain(state.actions, assertionChainStart);

    return {
        do: (callback: PageConsumer) => actionChain.do(callback),
        click: (selector: string) => actionChain.click(selector),
        then: () => actionChain.then(),
        expectThat: () => assertionChainStart.expectThat(),
    };
}
