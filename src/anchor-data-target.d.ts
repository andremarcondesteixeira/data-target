export declare type AnchorDataTargetConfig = {
    errorHandler: (error: unknown, anchor: HTMLAnchorElement) => void;
    httpRequestDispatcher: (anchor: HTMLAnchorElement) => Promise<{
        content: string;
        statusCode: number;
    }>;
};

declare global {
    interface Window {
        anchorDataTargetConfig: AnchorDataTargetConfig;
    }
}
