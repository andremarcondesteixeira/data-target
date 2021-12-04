import { Page, expect } from "@playwright/test";
import { EventLogger } from "../createEventLoggerFixture";
import { LoadEventDetail } from "../sharedTypes";
import { ContinuationChain } from "./ContinuationChain";

export class LoadEventAssertions {
    constructor(
        private assertions: ((page: Page, eventLogger: EventLogger) => Promise<void>)[] = [],
        private continuation: ContinuationChain
    ) { }

    hasBeenDispatchedWithDetails(expectedDetails: LoadEventDetail) {
        const assertion = async (_: Page, eventLogger: EventLogger) => {
            const eventDetail = await new Promise<LoadEventDetail>(resolve => {
                eventLogger.subscribe({
                    notify: (eventDetail: LoadEventDetail) => {
                        resolve(eventDetail);
                    },
                });
            });
            expect(eventDetail).toEqual(expectedDetails);
        };

        this.assertions.push(assertion);

        return this.continuation;
    }
}
