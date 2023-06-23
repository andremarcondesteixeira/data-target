import { test as base } from '@playwright/test';
import { createAnchorDataTargetLoadEventObserver } from './anchorDataTargetLoadEventObserver';
import { preparePage } from './preparePage';
import { withPageContent } from './withPageContextFixture';
import type { CustomFixtures } from './types';

const test = base.extend<CustomFixtures>({
    createAnchorDataTargetLoadEventObserver,
    preparePage,
    withPageContent,
});

export default test;
