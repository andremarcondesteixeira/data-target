import { Page, test as base } from '@playwright/test';
import createEventLogger, { EventLogger } from './createEventLoggerFixture';
import prepareContext, { PrepareContextFixture } from './prepareContextFixture';
import withPageContent, { WithPageContentFixture } from './withPageContentFixture';

export type CustomFixtures = {
    createEventLogger: (page: Page) => Promise<EventLogger>
    prepareContext: (html: string) => Promise<PrepareContextFixture>
    withPageContent: (html: string) => WithPageContentFixture
}

const test = base.extend<CustomFixtures>({
    createEventLogger,
    prepareContext,
    withPageContent,
});

export default test;
