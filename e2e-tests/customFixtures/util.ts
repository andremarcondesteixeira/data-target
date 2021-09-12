import fs from 'fs';
import path from 'path';
import { EventLogger, EventLogObserver } from './createEventLoggerFixture';
import { HyperlinksPlusPlusDOMContentLoadedEventDetail } from './sharedTypes';

export async function readFileContent(filename: string) {
    const stream = fs.createReadStream(path.join(__dirname, '..', ...filename.split('/')), {
        autoClose: true,
        encoding: 'utf-8'
    });

    let content = '';

    for await (const chunk of stream) {
        content += chunk;
    }

    return content;
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
