export declare type DataTargetConfig = {
    errorHandler: (error: unknown, element: HTMLAnchorElement | HTMLFormElement) => void;
    httpRequestDispatcher: (element: HTMLAnchorElement | HTMLFormElement) => Promise<{
        content: string;
        statusCode: number;
    }>;
};

declare global {
    interface Window {
        dataTargetConfig: DataTargetConfig;
    }
}
