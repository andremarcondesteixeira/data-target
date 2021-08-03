import express from 'express';
import getPort from 'get-port';

async function globalSetup() {
    console.log('starting server');

    const port = await getPort({ port: getPort.makeRange(3000, 8080) });
    process.env.SERVER_PORT = port.toString();

    const app = express();
    app.use(express.static('../'));
    const server = app.listen(port, 'localhost', () => {
        console.log(`server listening at port ${port}`);
    });

    return async () => {
        await new Promise(done => {
            server.close(done);
            console.log('server stoped');
        });
    };
}

export default globalSetup;
