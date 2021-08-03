declare const config: {
    urlTransformer: (url: string) => string;
    errorHandler: (error: Error) => void;
    httpRequestDispatcher: (url: string) => Promise<{
        content: string;
        statusCode: number;
    }>;
};
export default config;
//# sourceMappingURL=lib.d.ts.map