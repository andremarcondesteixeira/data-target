export declare type DataTargetConfig = {
    errorHandler: (error: unknown, element: HTMLAnchorElement | HTMLFormElement) => void;
    httpRequestDispatcherForAnchors: (anchor: HTMLAnchorElement) => Promise<{
        content: string;
        statusCode: number;
    }>;
    httpRequestDispatcherForForms: (anchor: HTMLFormElement) => Promise<{
        content: string;
        statusCode: number;
    }>;
};

declare global {
    interface Window {
        dataTargetConfig: DataTargetConfig;
    }
}
