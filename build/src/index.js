"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redisController_1 = require("./core/controllers/redisController");
const client_1 = require("./core/db/client");
const express = require('express');
const expressWs = require('express-ws');
const http = require('http'); // change to https
const timeout = require('connect-timeout');
const compression = require('compression');
// Our port
const port = 3001;
/// set DB client
(0, client_1.client)().then(c => (global.client = c));
// App and server
const app = express();
///
const server = http
    .createServer(app)
    .listen(port, () => console.log('Running on port 3001'));
// Apply expressWss
expressWs(app, server);
/*******************
 *  MIDDLEWARES
 *
 *****************/
app.use(timeout(1500));
app.use(express.json());
// compress all requests
app.use(compression());
app.use(express.static(__dirname + '/src/static'));
/// middleware for all api routes
app.all('/api/*', async (request, response, next) => {
    console.log('All API routes ...');
    const bearerHeader = request.headers.authorization;
    if (!bearerHeader) {
        return response.sendStatus(401);
    }
    else {
        const bearerToken = bearerHeader.split(' ')[1];
        console.log({ bearerToken });
        if (bearerToken !== 'THE_ONE')
            response.sendStatus(401);
        next();
    }
});
/// admin routes
app.all('/secret/*', (request, response, next) => {
    console.log('All Admin routes ...');
    /// set
    next();
});
// auth middleware => https://www.linode.com/docs/guides/authenticating-over-websockets-with-jwt/
// go to docs
app.get('/', (req, res) => {
    res.redirect('/docs/get-started');
});
///
app.get('/home', (req, res) => {
    res.redirect('/docs/get-started');
});
// boot/create a Redis index
app.get('/secret/boot', redisController_1.RedisController.createAnIndex);
// Get the route /
app.get('/secret/feed-data/:category', redisController_1.RedisController.feedData);
// http search
app.get('/api/v1/search/autocomplete/:key', redisController_1.RedisController.getAll);
/// websocket search
app.ws('/', (ws) => {
    ws.on('message', (msg) => {
        console.log({ msg });
        ws.send(msg);
    });
});
/// bad request
// app.get('*', (req: Request, res: Response) => {
//   res.status(400);
// });
/// If and when the app dies
process.once('exit', async () => {
    console.log('\x1b[31m%s\x1b[0m', 'PROCESS STOPPED...');
    /// the server and the client  close the connection
    global.client.quit();
});
// TO_DO
// fix structure
// env
// search , sort and filter
//# sourceMappingURL=index.js.map