"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redisController_1 = require("./core/controllers/redisController");
const client_1 = require("./core/db/client");
const express = require('express');
const expressWss = require('express-ws');
const http = require('http'); // change to https
const timeout = require('connect-timeout');
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
expressWss(app, server);
/*******************
 *  MIDDLEWARES
 *
 *****************/
// app.use(timeout(1000));
app.use(express.static(__dirname + '/static'));
// auth middleware => https://www.linode.com/docs/guides/authenticating-over-websockets-with-jwt/
// more https://github.dev/glynnbird/simple-autocomplete-service/blob/a922a4b773706192c996ba8486727572236ffa3e/app.js#L10
// app.use();
// go to docs
app.get('/', (req, res) => {
    res.redirect('/docs/get-started');
});
// boot/create a Redis index
app.get('/boot', redisController_1.RedisController.createAnIndex);
// Get the route /
app.get('/feed-data/:category', redisController_1.RedisController.feedData);
// http search
app.get('/search/autocomplete/:key', redisController_1.RedisController.getAll);
/// websocket search
app.ws('/', (ws) => {
    ws.on('message', (msg) => {
        console.log({ msg });
        ws.send(msg);
    });
});
/// bad request
app.get('*', (req, res) => {
    res.status(400);
});
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