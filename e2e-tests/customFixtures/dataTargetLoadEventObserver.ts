import { Page } from "@playwright/test";
import { DataTargetLoadEventSubscriber, LoadEventDetail, Observer, PlaywrightFixtures } from "./types";

export async function createDataTargetLoadEventObserver(
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
                addEventListener('data-target:loaded', event => {
                    logEventDetail(event.detail);
                });
            `
        });
        return observer;
    });
};

export class AnchorDataTargetLoadEventObserver implements Observer {
    eventDetailLog: LoadEventDetail[] = [];
    subscribers: DataTargetLoadEventSubscriber[] = [];

    push(eventDetail: LoadEventDetail) {
        this.eventDetailLog.push(eventDetail);
        this.notifyAllSubscribers(eventDetail);
    }

    notifyAllSubscribers(eventDetail: LoadEventDetail) {
        this.subscribers.forEach(callback => {
            callback(eventDetail);
        });
    }

    subscribe(callback: DataTargetLoadEventSubscriber) {
        this.subscribers.push(callback);
        this.eventDetailLog.forEach(eventDetail => {
            callback(eventDetail);
        });
    }
}
