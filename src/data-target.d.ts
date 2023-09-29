export declare type DataTargetDefinitions = {
    config: {
        errorHandler: (error: unknown, invokerElement?: HTMLAnchorElement | HTMLFormElement) => void;
        httpRequestDispatcher: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<{
            content: string;
            statusCode: number;
        }>;
        loadingMessageElement: () => HTMLElement;
    };
    programmaticAccess: {
        _dispatchRequestAndRenderResponse: (url: string, targetElementId: string) => void;
        _makeDataTargetAttributesWork: (root: HTMLElement) => void;
    }
};

declare global {
    interface Window {
        dataTarget: DataTargetDefinitions;
    }
}
