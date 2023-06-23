import { Page } from "@playwright/test";
import { LoadEventDetail, PlaywrightFixtures } from "./sharedTypes";

export async function createAnchorDataTargetLoadEventListener(
    { }: PlaywrightFixtures,
    use: (r: (page: Page) => Promise<AnchorDataTargetLoadEventObserver>) => Promise<void>
) {
    await use(async (page: Page): Promise<AnchorDataTargetLoadEventObserver> => {
        const observer = new AnchorDataTargetLoadEventObserver();
        await page.exposeFunction('logEventDetail', (eventDetail: LoadEventDetail) => {
            observer.push(eventDetail);
        });
        await page.addScriptTag({
            content: `
                addEventListener('anchor-data-target:load', event => {
                    logEventDetail(event.detail);
                });
            `
        });
        return observer;
    });
};

export class AnchorDataTargetLoadEventObserver {
    eventDetailLog: LoadEventDetail[] = [];
    subscribers: AnchorDataTargetLoadEventSubscriber[] = [];

    push(eventDetail: LoadEventDetail) {
        this.eventDetailLog.push(eventDetail);
        this.notifyAllSubscribers(eventDetail);
    }

    notifyAllSubscribers(eventDetail: LoadEventDetail) {
        this.subscribers.forEach(subscriber => {
            subscriber.notify(eventDetail);
        });
    }

    subscribe(subscriber: AnchorDataTargetLoadEventSubscriber) {
        this.subscribers.push(subscriber);
        this.eventDetailLog.forEach(eventDetail => {
            subscriber.notify(eventDetail);
        });
    }
}

export type AnchorDataTargetLoadEventSubscriber = {
    notify: (eventDetail: LoadEventDetail) => void;
};
