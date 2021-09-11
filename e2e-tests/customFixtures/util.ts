import fs from 'fs';
import path from 'path';
import { HyperlinksPlusPlusDOMContentLoadedEventDetail, EventLogObserver } from './types';

export async function readPageFileContent(filename: string) {
    const stream = fs.createReadStream(path.join(__dirname, '..', 'pages', ...filename.split('/')), {
        autoClose: true,
        encoding: 'utf-8'
    });

    let content = '';

    for await (const chunk of stream) {
        content += chunk;
    }

    return content;
}

export class EventLogObservable {
    eventDetailLog: HyperlinksPlusPlusDOMContentLoadedEventDetail[] = [];
    subscribers: EventLogObserver[] = [];

    push(eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) {
        this.eventDetailLog.push(eventDetail);
        this.notifyAll(eventDetail);
    }

    notifyAll(eventDetail: HyperlinksPlusPlusDOMContentLoadedEventDetail) {
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

export function targetElementHasReceivedContent(targetElementId: string, loadedFileName: string, notifier: EventLogObservable) {
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
        notifier.subscribe(observer);
    });
}
