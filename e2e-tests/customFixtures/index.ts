import { test as base } from '@playwright/test';
import { createDataTargetLoadEventObserver } from './dataTargetLoadEventObserver';
import { preparePage } from './preparePage';
import { withPageContent } from './withPageContentFixture';
import type { CustomFixtures } from './types';

const test = base.extend<CustomFixtures>({
    createDataTargetLoadEventObserver,
    preparePage,
    withPageContent,
});

export default test;
