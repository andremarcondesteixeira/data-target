import {
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions
} from '@playwright/test'
import { CustomFixtures } from '.'

export type HyperlinksPlusPlusDOMContentLoadedEventDetail = {
    url: string;
    targetElementSelector: string;
    responseStatusCode: number;
};

export type PlaywrightFixtures =
    CustomFixtures
    & PlaywrightTestArgs
    & PlaywrightTestOptions
    & PlaywrightWorkerArgs
    & PlaywrightWorkerOptions;
