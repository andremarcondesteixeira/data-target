import {
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions
} from '@playwright/test'
import { CustomFixtures } from '.'

export type LoadEventDetail = {
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
