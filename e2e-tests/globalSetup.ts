import 'dotenv/config';
import express from 'express';
import useragent from 'express-useragent';
import getPort from 'get-port';

export default async function globalSetup() {
    console.info('starting server');

    const port = await getPort({ port: getPort.makeRange(3000, 8080) });
    process.env.SERVER_PORT = port.toString();
    process.env.URL = `${process.env.URL}:${process.env.SERVER_PORT}`;

    const app = express()
        .use(useragent.express())
        .use((req, _, next) => {
            console.info(`${req.useragent?.browser} ${req.method} ${req.url}`);
            next();
        })
        .use(express.static(__dirname));

    const server = app.listen(port, 'localhost', () => {
        console.info(`server listening at ${process.env.URL}`);
    });

    return async () => {
        await new Promise(done => {
            server.close(done);
            console.info('server stopped');
        });
    };
}
