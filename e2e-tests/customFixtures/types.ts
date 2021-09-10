import { Page, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions } from '@playwright/test';

export type CustomFixtures = {
    withPageContent: (html: string) => WithPageContentFixture
};

export type HyperlinksPlusPlusDOMContentLoadedEventDetail = {
    url: string;
    targetElementId: string;
    responseStatusCode: number;
};

export type PageConsumer = (page: Page) => Promise<void>;

export type PlaywrightFixtures =
    CustomFixtures
    & PlaywrightTestArgs
    & PlaywrightTestOptions
    & PlaywrightWorkerArgs
    & PlaywrightWorkerOptions;

export type TargetElementIdVsLoadedFileName = {
    targetElementId: string;
    loadedFileName: string;
}

export type TestDefinition = {
    page: Page;
    pageHTMLContent: string;
    actions: PageConsumer[];
    targetsLoadedFiles: TargetElementIdVsLoadedFileName[]
};

export type WithPageContentFixture = {
    expectThatTarget: (target: string) => {
        receivedContentFromPage: (filename: string) => {
            test: () => Promise<void>;
            and: () => WithPageContentFixture
        }
    };
    do: (callback: PageConsumer) => WithPageContentFixture
};
