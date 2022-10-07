"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("./core/controllers/http");
const client_1 = require("./core/db/client");
const app_config_1 = require("./core/utils/app.config");
const rate_limiting_config_1 = require("./core/utils/rate-limiting.config");
const { rateLimitRedis } = require('@jwerre/rate-limit-redis');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
// Our port
const port = 3001;
/// set DB client
(0, client_1.client)().then(c => (global.client = c));
// console.log({
//   rr,
// });
// App and server
const app = express();
/*******************
 *  MIDDLEWARES
 *
 *****************/
app.use(cors());
app.use(express.json());
// use trust proxy if behind load balancer
app.enable('trust proxy');
app.use(rateLimitRedis(rate_limiting_config_1.rateLimitArgs));
// compress all requests
app.use(compression());
// app.use(express.static(__dirname + '/src/static'));
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
    const bearerHeader = request.headers.authorization;
    if (!bearerHeader) {
        response.sendStatus(403);
    }
    else {
        const bearerToken = bearerHeader.split(' ')[1];
        console.log({ bearerToken });
        if (bearerToken !== app_config_1.ADMIN_KEY)
            response.sendStatus(403);
        next();
    }
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
app.get('/secret/boot', http_1.RedisHttpController.createAnIndex);
// Get the route /
app.get('/secret/feed-data/:category', http_1.RedisHttpController.feedData);
// http search
app.get('/api/v1/autocomplete/:key', http_1.RedisHttpController.getAll);
/// If and when the app dies
process.once('exit', async () => {
    console.log('\x1b[31m%s\x1b[0m', 'PROCESS STOPPED...');
    /// the server and the client close the connection
    global.client.quit();
});
/// If and when the app dies
process.once('disconnect', async () => {
    console.log('\x1b[31m%s\x1b[0m', 'PROCESS DISCONNECTED...');
    /// the server and the client close the connection
    global.client.quit();
});
// app.listen(port, () => console.log('Running on port 3001'));
const server = app.listen(port);
server.on('error', () => {
    global.rateLimitRedis.disconnect();
});
//# sourceMappingURL=index.js.map