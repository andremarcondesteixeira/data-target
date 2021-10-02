import { Page } from "@playwright/test";
import { HyperlinksPlusPlusDOMContentLoadedEventDetail, PlaywrightFixtures } from "./sharedTypes";

export default async function createEventLogger(
    { }: PlaywrightFixtures,
    use: (r: (page: Page) => Promise<EventLogger>) => Promise<void>
) {
    await use(async (page: Page): Promise<EventLogger> => {
        const eventLogger = new EventLogger();
        await page.exposeFunction('logEventDetail', (eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) => {
            eventLogger.push(eventDetail);
        });
        await page.addScriptTag({
            content: `
                addEventListener('HyperLinksPlusPlus:DOMContentLoaded', event => {
                    logEventDetail(event.detail);
                });
            `
        });
        return eventLogger;
    });
};

export class EventLogger {
    eventDetailLog: HyperlinksPlusPlusDOMContentLoadedEventDetail[] = [];
    subscribers: EventLogObserver[] = [];

    push(eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) {
        this.eventDetailLog.push(eventDetail);
        this.notifyAllSubscribers(eventDetail);
    }

    notifyAllSubscribers(eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) {
        this.subscribers.forEach((subscriber: EventLogObserver) => {
            subscriber.notify(eventDetail);
        });
    }

    subscribe(subscriber: EventLogObserver) {
        this.subscribers.push(subscriber);
        this.eventDetailLog.forEach((eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) => {
            subscriber.notify(eventDetail);
        });
    }
}

export type EventLogObserver = {
    notify: (eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) => void
}

export function waitUntilTargetElementHasReceivedContent(
    targetElementId: string,
    loadedFileName: string,
    eventLogger: EventLogger
) {
    return new Promise<void>(resolve => {
        const observer: EventLogObserver = {
            notify: (eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) => {
                if (
                    eventDetail.responseStatusCode === 200
                    && eventDetail.targetElementId === targetElementId
                    && eventDetail.url.endsWith(loadedFileName)
                ) {
                    resolve();
                }
            }
        };
        eventLogger.subscribe(observer);
    });
}
