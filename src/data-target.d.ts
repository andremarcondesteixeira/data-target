export declare type DataTargetDefinitions = {
    config: {
        errorHandler: (
            error: unknown,
            urlOrInvokerElement?: string | URL | HTMLAnchorElement | HTMLFormElement
        ) => void;
        httpRequestDispatcher: (
            input: RequestInfo | URL,
            init?: RequestInit | undefined
        ) => Promise<{
            content: string;
            statusCode: number;
        }>;
        loadingIndicator: () => string | HTMLElement;
    };
    request: (
        urlOrInvokerElement: string | URL | HTMLAnchorElement | HTMLFormElement,
        targetElementId?: string
    ) => Promise<void>;
    attach: (root: HTMLElement) => void;
};

declare global {
    interface Window {
        dataTarget: DataTargetDefinitions;
    }
}
