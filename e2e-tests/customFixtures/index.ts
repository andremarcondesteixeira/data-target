import { Page, test as base } from '@playwright/test';
import { AnchorDataTargetLoadEventObserver, createAnchorDataTargetLoadEventListener } from './anchorDataTargetLoadEventListener';
import prepareContext, { PrepareContextFixtureArgs } from './prepareContext';
import withPageContent from './withPageContextFixture';
import { WithPageContentFixture } from './withPageContextFixture/withPageContent';

export type CustomFixtures = {
    createAnchorDataTargetLoadEventListener: (page: Page) => Promise<AnchorDataTargetLoadEventObserver>
    prepareContext: (args: PrepareContextFixtureArgs) => Promise<Page>
    withPageContent: (withPageContentHtml: string) => WithPageContentFixture
}

const test = base.extend<CustomFixtures>({
    createAnchorDataTargetLoadEventListener,
    prepareContext,
    withPageContent,
});

export default test;
