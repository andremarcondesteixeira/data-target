import 'dotenv/config';
import express from 'express';

export default async function globalSetup() {
    const host = process.env['E2E_TESTS_SERVER_HOST'];
    if (!host) {
        throw new Error('Please define a value for the E2E_TESTS_SERVER_HOST environment variable to define a hostname for the end-to-end tests server');
    }

    const portFromEnvFile = process.env['E2E_TESTS_SERVER_PORT'];
    if (!portFromEnvFile) {
        throw new Error('Please define a value for the E2E_TESTS_SERVER_PORT environment variable to define a port for the end-to-end tests server');
    }
    const port = parseInt(portFromEnvFile);

    process.env['BASE_URL'] = `http://${host}:${port}`;

    const isDebugMode = process.env['DEBUG_MODE'] === '1';
    isDebugMode && console.info('starting server');

    const server = express()
        .use(express.static(__dirname, { fallthrough: false }))
        .listen(port, host as string, () => {
            isDebugMode && console.info(`server listening at ${process.env['BASE_URL']}`);
        });

    return () => new Promise(done => {
        server.close(done);
        isDebugMode && console.info('server stopped');
    });
}
