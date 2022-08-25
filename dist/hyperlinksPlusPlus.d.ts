export declare type ContentLoadedEventDetail = {
    url: string;
    targetElementSelector: string;
    responseStatusCode: number;
};
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
//# sourceMappingURL=HyperlinksPlusPlus.d.ts.map