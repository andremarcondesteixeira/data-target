import {
    Page,
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions
} from '@playwright/test';

export type ActionsInterface = {
    do(callback: (page: Page) => Promise<void>): ActionsInterface;
    click(selector: string): ActionsInterface;
    then(): AssertionsEntryPointInterface;
}

export type AnchorDataTargetLoadEventObserverFixture = (page: Page) => Promise<Observer>;

export type AnchorDataTargetLoadEventSubscriber = (eventDetail: LoadEventDetail) => void;

export type Assertion = (page: Page, observer: Observer) => Promise<void>;

export type AssertionsEntryPointInterface = {
    expectThat(): AssertionsInterface;
}

export type AssertionsInterface = {
    element(selector: string): ElementAssertionsInterface;
    loadEvent(): LoadEventAssertionsInterface;
}

export type ContinuationInterface = {
    and(): ContinueOrFinishInterface;
}

export type ContinueOrFinishInterface = {
    expectThat(): AssertionsInterface;
}

export type CustomFixtures = {
    createAnchorDataTargetLoadEventObserver: AnchorDataTargetLoadEventObserverFixture;
    preparePage: PreparePageFixture;
    withPageContent: WithPageContentFixture;
}

export type ElementAssertionsInterface = {
    hasSameContentOf(filename: string): ContinuationInterface;
}

export type LoadEventAssertionsInterface = {
    hasBeenDispatchedWithDetails(expectedDetails: LoadEventDetail): ContinuationInterface;
}

export type LoadEventDetail = {
    url: string;
    targetElementId: string;
    responseStatusCode: number;
};

export type Observer = {
    push(eventDetail: LoadEventDetail): void;
    notifyAllSubscribers(eventDetail: LoadEventDetail): void;
    subscribe(callback: AnchorDataTargetLoadEventSubscriber): void;
}

export type PlaywrightFixtures = CustomFixtures & PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions;

export type PreparePageFixture = (args: PreparePageFixtureArgs) => Promise<Page>;

export type PreparePageFixtureArgs = {
    pageContent: string;
    beforeLoadingLib?: (page: Page) => Promise<void>;
}

export type WithPageContentFixture = (withPageContentHtml: string) => ActionsInterface;
