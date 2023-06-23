import { Page, expect } from "@playwright/test";
import { AnchorDataTargetLoadEventObserver } from "../anchorDataTargetLoadEventObserver";
import { Assertion, ContinuationInterface, LoadEventAssertionsInterface, LoadEventDetail } from "../types";

export class LoadEventAssertions implements LoadEventAssertionsInterface {
    constructor(
        private assertions: Assertion[] = [],
        private continuation: ContinuationInterface
    ) { }

    hasBeenDispatchedWithDetails(expectedDetails: LoadEventDetail) {
        const assertion = async (_: Page, eventLogger: AnchorDataTargetLoadEventObserver) => {
            const eventDetail = await new Promise<LoadEventDetail>(resolve => {
                eventLogger.subscribe((eventDetail: LoadEventDetail) => {
                    resolve(eventDetail);
                });
            });
            expect(eventDetail).toEqual(expectedDetails);
        };

        this.assertions.push(assertion);

        return this.continuation;
    }
}
