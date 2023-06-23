import { Page, expect } from "@playwright/test";
import { AnchorDataTargetLoadEventObserver } from "../anchorDataTargetLoadEventListener";
import { LoadEventDetail } from "../sharedTypes";
import { Continuation } from "./Continuation";

export class LoadEventAssertions {
    constructor(
        private assertions: ((page: Page, eventLogger: AnchorDataTargetLoadEventObserver) => Promise<void>)[] = [],
        private continuation: Continuation
    ) { }

    hasBeenDispatchedWithDetails(expectedDetails: LoadEventDetail) {
        const assertion = async (_: Page, eventLogger: AnchorDataTargetLoadEventObserver) => {
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
