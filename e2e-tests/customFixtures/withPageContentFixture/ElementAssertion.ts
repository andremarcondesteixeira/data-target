import { Page, expect } from "@playwright/test";
import { Assertion, ContinuationInterface, ElementAssertionsInterface, LoadEventDetail, Observer } from "../types";
import { readFileContent } from "../util";

export class ElementAssertions implements ElementAssertionsInterface {
    constructor(
        private assertions: Assertion[] = [],
        private selector: string,
        private continuation: ContinuationInterface,
    ) { }

    hasSameContentOf(filename: string) {
        this.assertions.push(async (page: Page, observer: Observer) => {
            await this.compare_element_inner_html_against_file(page, filename, observer);
        });
        return this.continuation;
    }

    private async compare_element_inner_html_against_file(page: Page, filename: string, observer: Observer) {
        await this.wait_until_target_element_has_received_content(observer);
        const locator = page.locator(this.selector);
        const actualInnerHTML = (await locator.innerHTML()).trim().replace(/\r\n/g, '\n');
        const expectedInnerHTML = (await readFileContent(filename)).trim().replace(/\r\n/g, '\n');
        expect(actualInnerHTML).toEqual(expectedInnerHTML);
    }

    private wait_until_target_element_has_received_content(observer: Observer): Promise<LoadEventDetail> {
        return new Promise<LoadEventDetail>(resolve => {
            observer.subscribe((eventDetail: LoadEventDetail) => {
                resolve(eventDetail);
            });
        });
    }
}
