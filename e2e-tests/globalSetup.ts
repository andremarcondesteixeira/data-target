import 'dotenv/config';
import express from 'express';
import useragent from 'express-useragent';

export default async function globalSetup() {
    const isDebugMode = process.env['DEBUG_MODE'] === '1';
    isDebugMode && console.info('starting server');

    const portFromEnvFile = process.env['E2E_TESTS_SERVER_PORT'];

    if (!portFromEnvFile) {
        throw new Error('Please define a value for the E2E_TESTS_SERVER_PORT environment variable to define a port for the end-to-end tests server');
    }

    const port = parseInt(portFromEnvFile);
    process.env['BASE_URL'] = `http://${process.env['HOST']}:${port}`;

    const server = express()
        .use(useragent.express())
        .use((req, _, next) => {
            isDebugMode && console.info(`${req.useragent?.browser} -> ${req.method} ${req.url}`);
            next();
        })
        .use(express.static(__dirname, { fallthrough: false }))
        .listen(port, process.env['HOST'] as string, () => {
            isDebugMode && console.info(`server listening at ${process.env['BASE_URL']}`);
        });

    return async () => {
        await new Promise(done => {
            server.close(done);
            isDebugMode && console.info('server stopped');
        });
    };
}
