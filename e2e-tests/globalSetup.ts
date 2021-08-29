import 'dotenv/config';
import express from 'express';
import useragent from 'express-useragent';
import getPort from 'get-port';

export default async function globalSetup() {
    const isDebugMode = process.env.DEBUG_MODE === '1';

    isDebugMode && console.info('starting server');

    const port = await getPort();
    process.env.URL = `http://${process.env.HOST}:${port}`;

    const server = express()
        .use(useragent.express())
        .use((req, res, next) => {
            isDebugMode && console.info(`${req.useragent?.browser} -> ${req.method} ${req.url}`);
            next();
        })
        .use(express.static(__dirname, { fallthrough: false }))
        .listen(port, process.env.HOST, () => {
            isDebugMode && console.info(`server listening at ${process.env.URL}`);
        });

    return async () => {
        await new Promise(done => {
            server.close(done);
            isDebugMode && console.info('server stopped');
        });
    };
}
