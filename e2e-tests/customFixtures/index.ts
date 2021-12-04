import { Page, test as base } from '@playwright/test';
import createEventLogger, { EventLogger } from './createEventLoggerFixture';
import prepareContext, { PrepareContextFixtureArgs } from './prepareContextFixture';
import withPageContent from './withPageContextFixture';
import { WithPageContentFixture } from './withPageContextFixture/withPageContentFixture';

export type CustomFixtures = {
    createEventLogger: (page: Page) => Promise<EventLogger>
    prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>
    withPageContent: (html: string) => WithPageContentFixture
}

const test = base.extend<CustomFixtures>({
    createEventLogger,
    prepareContext,
    withPageContent,
});

export default test;
