declare const config: {
    urlTransformer: (url: string) => string;
    errorHandler: (error: unknown) => void;
    httpRequestDispatcher: (url: string) => Promise<{
        content: string;
        statusCode: number;
    }>;
};
export default config;
export declare type ContentLoadedEventDetail = {
    url: string;
    targetElementSelector: string;
    responseStatusCode: number;
};
//# sourceMappingURL=HyperlinksPlusPlus.d.ts.map