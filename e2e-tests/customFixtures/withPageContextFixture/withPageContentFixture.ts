import { ActionsChain } from "./ActionsChain";
import { AssertionsChainRoot } from "./AssertionsChainRoot";
import { PageConsumer } from "./types"

export class WithPageContentFixture {
    constructor(
        private actionsChain: ActionsChain,
        private assertionsChainRoot: AssertionsChainRoot,
    ) { }

    do(callback: PageConsumer) {
        return this.actionsChain.do(callback);
    }

    click(selector: string) {
        return this.actionsChain.click(selector);
    }

    then() {
        return this.actionsChain.then();
    }

    expectThat() {
        return this.assertionsChainRoot.expectThat();
    }
}
