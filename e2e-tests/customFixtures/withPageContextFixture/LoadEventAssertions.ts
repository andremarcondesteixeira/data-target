import { Page, expect } from "@playwright/test";
import { Assertion, ContinuationInterface, LoadEventAssertionsInterface, LoadEventDetail, Observer } from "../types";

export class LoadEventAssertions implements LoadEventAssertionsInterface {
    constructor(
        private assertions: Assertion[] = [],
        private continuation: ContinuationInterface
    ) { }

    hasBeenDispatchedWithDetails(expectedDetails: LoadEventDetail) {
        const assertion = async (_: Page, observer: Observer) => {
            const eventDetail = await new Promise<LoadEventDetail>(resolve => {
                observer.subscribe((eventDetail: LoadEventDetail) => {
                    resolve(eventDetail);
                });
            });
            expect(eventDetail).toEqual(expectedDetails);
        };

        this.assertions.push(assertion);

        return this.continuation;
    }
}
