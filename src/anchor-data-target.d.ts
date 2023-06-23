export declare type AnchorDataTargetConfig = {
    errorHandler: (error: unknown) => void;
    httpRequestDispatcher: (url: string) => Promise<{
        content: string;
        statusCode: number;
    }>;
};

declare global {
    interface Window {
        anchorDataTargetConfig: AnchorDataTargetConfig;
    }
}
