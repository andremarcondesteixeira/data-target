import { test as base } from '@playwright/test';
import { CustomFixtures } from './types';
import withPageContent from './withPageContent';

const test = base.extend<CustomFixtures>({
    withPageContent
});

export default test;
