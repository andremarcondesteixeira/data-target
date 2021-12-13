import { Page, expect } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { LoadEventDetail } from "../sharedTypes";
import { readFileContent } from "../util";
import { ContinuationChain } from "./ContinuationChain";

export class ElementAssertions {
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
        await this.waitUntilElementHasReceivedContent(page, filename, eventLogger);
        const targetElement = await page.$(this.selector);
        const actualInnerHTML = (await targetElement.innerHTML()).trim();
        const expectedInnerHTML = (await readFileContent(filename)).trim();
        expect(actualInnerHTML).toBe(expectedInnerHTML);
    }

    private waitUntilElementHasReceivedContent(
        page: Page,
        loadedFileName: string,
        eventLogger: EventLogger
    ): Promise<void> {
        return new Promise<void>(resolve => {
            this.get_dataTarget_attribute_value_that_points_to_this_same_element(page)
                .then((targetElementSelector: string) => {
                    eventLogger.subscribe({
                        notify: (eventDetail: LoadEventDetail) => {
                            if (
                                eventDetail.responseStatusCode === 200
                                && eventDetail.targetElementSelector === targetElementSelector
                                && eventDetail.url.endsWith(loadedFileName)
                            ) {
                                resolve();
                            }
                        },
                    });
                });
        });
    }

    private async get_dataTarget_attribute_value_that_points_to_this_same_element(page: Page): Promise<string> {
        return await page.evaluate(args => {
            const [html, selector_maybe_not_equal_to_dataTarget_attribute_value] = args;

            const wrapper = window.document.createElement('div');
            wrapper.insertAdjacentHTML('afterbegin', html);
            const desiredTargetElement = wrapper.querySelector(selector_maybe_not_equal_to_dataTarget_attribute_value);

            const anchors = Array.from(wrapper.querySelectorAll('a[data-target]'));
            const dataTargetAttributeValues = anchors.map(a => a.getAttribute('data-target'));

            const dataTargetAttributeValue = dataTargetAttributeValues.filter(dataTargetAttributeValue => {
                const element_pointed_to_by_dataTarget_attribute_value = wrapper.querySelector(dataTargetAttributeValue);
                return element_pointed_to_by_dataTarget_attribute_value === desiredTargetElement;
            })[0];

            return dataTargetAttributeValue;
        }, [this.html, this.selector]);
    }
}
