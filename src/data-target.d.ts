export declare type DataTargetDefinitions = {
    config: {
        errorHandler: (
            error: unknown,
            urlOrInvokerElement?: string | URL | HTMLAnchorElement | HTMLFormElement
        ) => void;
        httpRequestDispatcher: (
            input: RequestInfo | URL,
            init?: RequestInit
        ) => Promise<{
            content: string;
            statusCode: number;
        }>;
    };
    $: {
        request: (
            urlOrInvokerElement: string | URL | HTMLAnchorElement | HTMLFormElement,
            targetElementId?: string,
            init?: RequestInit
        ) => Promise<void>;
        attach: (root: HTMLElement) => void;
    }
};

declare global {
    interface Window {
        dataTarget: DataTargetDefinitions;
    }
}
