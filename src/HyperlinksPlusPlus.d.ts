export declare type HyperlinksPlusPlusConfig = {
    urlTransformer: (url: string) => string;
    errorHandler: (error: unknown) => void;
    httpRequestDispatcher: (url: string) => Promise<{
        content: string;
        statusCode: number;
    }>;
};

declare global {
    interface Window {
        hyperlinksPlusPlusConfig: HyperlinksPlusPlusConfig;
    }
}
