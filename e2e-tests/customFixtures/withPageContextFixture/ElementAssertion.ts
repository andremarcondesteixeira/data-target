import { Page, expect } from "@playwright/test";
import { EventLogger, waitUntilTargetElementHasReceivedContent } from "../createEventLoggerFixture";
import { readFileContent } from "../util";
import { ContinuationChain } from "./ContinuationChain";

export class ElementAssertion {
    constructor(
        private html: string,
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [],
        private selector: string,
        private continuation: ContinuationChain,
    ) { }

    hasSameContentOf(filename: string) {
        this.assertions.push(async (page: Page, eventLogger: EventLogger) => {
            await this.compareElementContentAgainstFile(page, filename, eventLogger);
        });
        return this.continuation;
    }

    private async compareElementContentAgainstFile(page: Page, filename: string, eventLogger: EventLogger) {
        const targetSelector = await this.usePageToExtractTargetSelector(page);
        await waitUntilTargetElementHasReceivedContent(targetSelector, filename, eventLogger);
        const targetElement = await page.$(this.selector);
        const actualInnerHTML = (await targetElement.innerHTML()).trim();
        const expectedInnerHTML = (await readFileContent(filename)).trim();
        expect(actualInnerHTML).toBe(expectedInnerHTML);
    }

    private async usePageToExtractTargetSelector(page: Page) {
        return await page.evaluate(args => {
            const [html, selector] = args;

            const div = window.document.createElement('div');
            div.insertAdjacentHTML('afterbegin', html);
            const desiredTarget = div.querySelector(selector);

            const anchors = div.querySelectorAll('a[data-target]');
            const dataTargets = Array.from(anchors).map(a => a.getAttribute('data-target'));

            const targetSelector = dataTargets.filter(targetSelector => {
                const targetForThisAnchor = div.querySelector(targetSelector);
                return targetForThisAnchor === desiredTarget;
            })[0];

            return targetSelector;
        }, [this.html, this.selector]);
    }
}
