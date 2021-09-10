import { Page } from '@playwright/test';

export type CustomFixtures = {
    withPageContent: (html: string) => WithPageContentFixture
};

export type HyperlinksPlusPlusDOMContentLoadedEventDetail = {
    url: string;
    targetElementId: string;
    responseStatusCode: number;
};

export type PageConsumer = (page: Page) => Promise<void>;

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

type WithPageContentFixture = {
    expectThatTarget: (target: string) => {
        receivedContentFromFile: (filename: string) => {
            test: () => Promise<void>;
            and: () => WithPageContentFixture
        }
    };
    do: (callback: PageConsumer) => WithPageContentFixture
};
