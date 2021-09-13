import { Page, test as base } from '@playwright/test';
import createEventLogger, { EventLogger } from './createEventLoggerFixture';
import prepareContext from './prepareContextFixture';
import withPageContent, { WithPageContentFixture } from './withPageContentFixture';

export type CustomFixtures = {
    createEventLogger: (page: Page) => Promise<EventLogger>
    prepareContext: (html: string, intermediateStep?: (page: Page) => Promise<void>) => Promise<Page>
    withPageContent: (html: string) => WithPageContentFixture
}

const test = base.extend<CustomFixtures>({
    createEventLogger,
    prepareContext,
    withPageContent,
});

export default test;
